import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  console.log('Test endpoint called!') // Debug log
  
  try {
    console.log('Starting test data generation...') // Debug log
    
    // Ultra simple test data
    const testData = {
      title: "Test Case Study",
      sections: {
        summary: "This is a test summary.",
        client: "This is test client info.",
        challenges: "These are test challenges.",
        solution: "This is the test solution.",
        results: "These are test results."
      },
      wordpressContent: `
<!-- wp:heading -->
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
<!-- /wp:paragraph -->
      `.trim(),
      sidebarContent: {
        challenge: "Test challenge sidebar",
        results: "Test results sidebar"
      },
      previewQuote: "Test quote",
      imagePrompt: "Test image prompt"
    };

    console.log('Returning test data:', testData) // Debug log
    return NextResponse.json(testData);
    
  } catch (error) {
    console.error('Error in test endpoint:', error);
    return NextResponse.json(
      { error: 'Test endpoint failed', details: String(error) },
      { status: 500 }
    );
  }
}
