# Case Study Generator - Usage Guide

## Setup Instructions

1. **Install Dependencies**
   ```bash
   pip install -r requirements.txt
   ```

2. **Set Up OpenAI API Key**
   - Copy `.env.example` to `.env`
   - Add your OpenAI API key:
     ```
     OPENAI_API_KEY=your_actual_api_key_here
     ```

## Basic Usage

### Command Line Interface

Generate a case study using the CLI:

```bash
python case_study_generator.py \
  --client "Northeastern University London" \
  --industry "Higher Education" \
  --challenge "Poor mobile connectivity in dense urban campus" \
  --solution "CEL-FI QUATRA 1000 mobile signal boosters" \
  --location "London, UK" \
  --scale "2.5 floors, 1300 students" \
  --technologies "CEL-FI QUATRA 1000,CAT-6 cabling,MIMO antennae" \
  --output "my_case_study.txt"
```

### Required Parameters

- `--client` (-c): Client/company name
- `--industry` (-i): Industry or sector
- `--challenge` (-ch): Main challenge faced
- `--solution` (-s): Solution provided

### Optional Parameters

- `--location` (-l): Project location
- `--scale`: Project scale or size
- `--technologies` (-t): Technologies used (comma-separated)
- `--context`: Additional context or details
- `--output` (-o): Output file path (prints to console if not specified)

## Example Outputs

The generator creates content in WordPress block format with these sections:

1. **Summary** - Overview of the challenge and solution
2. **The Client** - Description of the client organization
3. **The Challenges** - Detailed list of problems faced
4. **The Solution** - Explanation of the implemented solution
5. **The Results** - Outcomes and benefits achieved

## Programmatic Usage

You can also use the generator programmatically:

```python
from models import CaseStudyInput
from ai import AIContentGenerator
from templates import WordPressFormatter

# Create input
case_input = CaseStudyInput(
    client_name="Your Client",
    industry="Your Industry", 
    main_challenge="Main Challenge",
    solution_provided="Your Solution"
)

# Generate content
generator = AIContentGenerator()
summary = generator.generate_summary(case_input)

# Format for WordPress
formatter = WordPressFormatter()
formatted = formatter.format_section("Summary", summary)
```

## WordPress Integration

The generated content is in WordPress Gutenberg block format and can be:

1. Copied directly into WordPress block editor
2. Imported via WordPress REST API
3. Used with WordPress CLI tools

## Tips for Best Results

1. **Be Specific**: Provide detailed, specific information about the client and solution
2. **Use Real Technologies**: Mention actual product names and technologies when possible
3. **Include Context**: Add location, scale, and other relevant details
4. **Review and Edit**: AI-generated content should be reviewed and customized

## Troubleshooting

- **API Key Error**: Ensure your OpenAI API key is correctly set in the `.env` file
- **Import Errors**: Make sure all dependencies are installed with `pip install -r requirements.txt`
- **Long Generation Time**: AI content generation can take 30-60 seconds depending on OpenAI API response times
