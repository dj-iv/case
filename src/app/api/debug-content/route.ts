import { NextRequest, NextResponse } from 'next/server'

export async function GET() {
  // Generate the exact same content that our test endpoint creates
  const testContent = `<!-- wp:heading -->
<h2 class="wp-block-heading">Summary</h2>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>This is a test summary.</p>
<!-- /wp:paragraph -->

<!-- wp:heading -->
<h2 class="wp-block-heading">The Client</h2>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>This is test client info.</p>
<!-- /wp:paragraph -->

<!-- wp:heading -->
<h2 class="wp-block-heading">The Challenges</h2>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>These are test challenges.</p>
<!-- /wp:paragraph -->

<!-- wp:heading -->
<h2 class="wp-block-heading">The Solution</h2>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>This is the test solution.</p>
<!-- /wp:paragraph -->

<!-- wp:heading -->
<h2 class="wp-block-heading">The Results</h2>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>These are test results.</p>
<!-- /wp:paragraph -->`

  return NextResponse.json({
    content: testContent,
    contentLength: testContent.length,
    contentType: typeof testContent,
    firstChars: testContent.substring(0, 100),
    lastChars: testContent.substring(testContent.length - 100),
    hexBytes: Buffer.from(testContent).toString('hex').substring(0, 200),
    hasNonPrintable: /[\x00-\x1F\x7F-\x9F]/.test(testContent),
    lineEndings: testContent.includes('\r\n') ? 'CRLF' : testContent.includes('\n') ? 'LF' : 'none'
  })
}
