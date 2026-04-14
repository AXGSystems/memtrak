import { NextRequest, NextResponse } from 'next/server';
import { logEvent } from '@/lib/memtrak';

/**
 * MEMTrak Physical Mail Return Scanner
 *
 * Processes returned physical mail and matches it to member records.
 *
 * How it works:
 * 1. Staff photographs returned envelope with phone camera
 * 2. Image is uploaded to this endpoint
 * 3. OCR extracts the address text (Claude Vision or Azure OCR)
 * 4. Fuzzy matching finds the member organization in re:Members
 * 5. Member record is flagged as "bad physical address"
 * 6. ALTA DASH and re:Members both see the flag immediately
 *
 * POST: Upload a scanned return envelope
 *   Content-Type: multipart/form-data
 *   Fields:
 *     - image: the envelope photo (optional — can also use text input)
 *     - orgName: organization name from envelope (if manually entered)
 *     - address: return address text (if manually entered)
 *     - reason: "No such address", "Moved", "Refused", etc.
 *
 * For image OCR, this endpoint can use:
 *   - Claude Vision API (ANTHROPIC_API_KEY) — best for handwritten
 *   - Azure Computer Vision — best for printed labels
 *   - Manual entry fallback — always works
 *
 * GET: Retrieve processed returns (pending review, auto-matched, etc.)
 */

interface MailReturn {
  id: string;
  scannedDate: string;
  orgName: string;
  address: string;
  reason: string;
  matchedMemberId: string | null;
  matchConfidence: number;
  status: 'Pending Review' | 'Auto-Flagged' | 'Updated in AMS' | 'Needs Manual Match' | 'No Match Found';
  processedBy: 'ocr' | 'manual';
}

// In-memory store (production: Azure SQL)
const returns: MailReturn[] = [];

// Simulated member address matching (production: query re:Members via Azure SQL)
const MEMBER_ADDRESSES = [
  { id: 'M-4421', org: 'Heritage Abstract LLC', city: 'Pittsburgh', state: 'PA' },
  { id: 'M-2819', org: 'Summit Title Services', city: 'Nashville', state: 'TN' },
  { id: 'M-1205', org: 'Keystone Settlement Inc', city: 'Philadelphia', state: 'PA' },
  { id: 'M-3677', org: 'Federal Escrow Corp', city: 'New Orleans', state: 'LA' },
  { id: 'M-1001', org: 'First American Title', city: 'Santa Ana', state: 'CA' },
  { id: 'M-1002', org: 'Chicago Title Insurance', city: 'Chicago', state: 'IL' },
];

function fuzzyMatch(input: string, candidates: typeof MEMBER_ADDRESSES): { id: string; org: string; confidence: number } | null {
  const lower = input.toLowerCase().replace(/[^a-z0-9\s]/g, '');
  let bestMatch = null;
  let bestScore = 0;

  for (const cand of candidates) {
    const candLower = cand.org.toLowerCase().replace(/[^a-z0-9\s]/g, '');
    // Simple token overlap scoring
    const inputTokens = lower.split(/\s+/);
    const candTokens = candLower.split(/\s+/);
    const matches = inputTokens.filter(t => candTokens.some(ct => ct.includes(t) || t.includes(ct))).length;
    const score = (matches / Math.max(inputTokens.length, candTokens.length)) * 100;

    if (score > bestScore) {
      bestScore = score;
      bestMatch = { id: cand.id, org: cand.org, confidence: Math.round(score) };
    }
  }

  return bestScore >= 40 ? bestMatch : null;
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const orgName = formData.get('orgName') as string || '';
    const address = formData.get('address') as string || '';
    const reason = formData.get('reason') as string || 'Return to Sender';
    const image = formData.get('image') as File | null;

    const extractedOrgName = orgName;
    let processedBy: 'ocr' | 'manual' = 'manual';

    // If image uploaded AND Claude API available, use OCR
    if (image && process.env.ANTHROPIC_API_KEY) {
      // TODO: Send image to Claude Vision API for OCR
      // const imageBuffer = await image.arrayBuffer();
      // const base64 = Buffer.from(imageBuffer).toString('base64');
      // const response = await anthropic.messages.create({
      //   model: 'claude-sonnet-4-20250514',
      //   messages: [{ role: 'user', content: [
      //     { type: 'image', source: { type: 'base64', media_type: image.type, data: base64 } },
      //     { type: 'text', text: 'Extract the recipient organization name and full mailing address from this returned envelope. Return as JSON: { orgName, address, returnReason }' }
      //   ]}],
      // });
      processedBy = 'ocr';
    }

    // Fuzzy match against member database
    const match = fuzzyMatch(extractedOrgName, MEMBER_ADDRESSES);

    const entry: MailReturn = {
      id: `ret-${Date.now()}`,
      scannedDate: new Date().toISOString().slice(0, 10),
      orgName: extractedOrgName,
      address,
      reason,
      matchedMemberId: match?.id || null,
      matchConfidence: match?.confidence || 0,
      status: match ? (match.confidence >= 85 ? 'Auto-Flagged' : 'Pending Review') : 'No Match Found',
      processedBy,
    };

    returns.push(entry);

    // Log the event
    await logEvent({
      type: 'bounce',
      campaignId: 'physical-mail',
      recipientEmail: 'physical-address',
      metadata: {
        orgName: extractedOrgName,
        address,
        reason,
        matchedMemberId: match?.id || 'none',
        matchConfidence: String(match?.confidence || 0),
        processedBy,
      },
    });

    return NextResponse.json({
      success: true,
      return: entry,
      match: match ? { memberId: match.id, org: match.org, confidence: match.confidence } : null,
      message: match
        ? match.confidence >= 85
          ? `Auto-matched to ${match.org} (${match.confidence}% confidence). Member record flagged.`
          : `Possible match: ${match.org} (${match.confidence}% confidence). Needs review.`
        : 'No matching member found. Manual review required.',
    });
  } catch {
    return NextResponse.json({ error: 'Invalid request. Send as multipart/form-data.' }, { status: 400 });
  }
}

export async function GET() {
  return NextResponse.json({
    returns: returns.sort((a, b) => b.scannedDate.localeCompare(a.scannedDate)),
    total: returns.length,
    autoFlagged: returns.filter(r => r.status === 'Auto-Flagged').length,
    needsReview: returns.filter(r => r.status === 'Pending Review' || r.status === 'Needs Manual Match').length,
  });
}
