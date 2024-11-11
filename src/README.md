# Godspeed SendGrid Email Integration

Welcome to the [Godspeed](https://www.godspeed.systems/) SendGrid Integration guide! This project helps you automate email sending and track email metrics using SendGrid, with status logging to Google Sheets.

## Features

- Automated email sending via SendGrid API
- Real-time email tracking (opens, clicks, bounces, etc.)
- Automatic logging of email status to Google Sheets
- Webhook integration for event tracking

## Prerequisites

- Node.js installed on your system
- A SendGrid account
- A Google Cloud account
- Basic familiarity with API concepts

## Quick Start

### 1. Project Setup

```bash
# Install Godspeed CLI globally
npm install -g @godspeedsystems/godspeed

# Clone the repository
git clone [your-repo-url]
cd godspeed-sendgrid-datasource

# Install dependencies
npm install

# Create environment file
cp .env
```

### 2. SendGrid Configuration

#### A. API Setup

1. Log in to [SendGrid Dashboard](https://sendgrid.com/)
2. Navigate to: Settings → API Keys → Create API Key
3. Set permissions to "Full Access"
4. Copy the generated API key
5. Add to your `.env`:
   ```
   SENDGRID_API_KEY=your_api_key_here
   SENDGRID_DEFAULT_SENDER=your_default_sender_email
   ```

#### B. Sender Authentication

1. Go to Settings → Sender Authentication
2. Choose authentication method:
   - **Recommended**: Domain Authentication
     - Follow the DNS configuration steps
     - Add provided DNS records to your domain provider
   - **Alternative**: Single Sender Verification
     - If you don't have a domain, then you opt for Single Sender Verification but this is not encouraged by sendgrip.
     - Use for testing only
     - Verify your sender email address, even the default sender that you set in env

#### C. Event Webhook Setup

1. Go to Settings → Mail Settings → Event Webhook
2. Click on **Create Webhook URL** and configure webhook:
   - URL: `https://your-domain.com/event-tracking`
   - For local development:
     1. Install [ngrok](https://ngrok.com/)
     2. Run: `ngrok http 3000`
     3. Use the generated HTTPS URL with /event-tracking
   - Select events: processed, delivered, open, click, bounce
3. Save configuration

### 3. Google Sheets Integration

#### A. Google Cloud Setup

1. Visit [Google Cloud Console](https://console.cloud.google.com/)
2. Create/select a project
3. Enable Google Sheets API:
   - Search for "Google Sheets API"
   - Click Enable

#### B. Service Account Configuration

1. In the left sidebar, navigate to IAM & Admin → Service Accounts
2. Create service account:
   - Name: `godspeed-sendgrid`
   - Role: Project → Owner
   - Click on **create**
3. Create key:
   - In the **Service Accounts** section, find the account you just created.
   - Click the three dots on the right and select **Manage Keys**.
   - Click **Add Key > Create New Key**.
   - Choose **JSON** as the key type and click **Create**.
   - A .json file containing the service account's credentials will be downloaded. Save this file in the root of your project with name **google-key.json**.

#### C. Spreadsheet Setup

1. Create a copy of our [template spreadsheet](https://docs.google.com/spreadsheets/d/13w9a9fwpGJDZ68husCHv2VU6rWtdGk7gtAxrIYTDxFc/edit?usp=sharing)
2. Share with service account:
   - Open the Google Sheet that you just copied, we will use this to store email logs.
   - Click the **Share** button in the top-right corner.
   - In the **Share with people and groups** field, enter the **Service Account email** (you can find it in the downloaded .json file under the client_email field).
   - Set the permission to **editor**.
   - Click **Send** to share the sheet with the service account.
3. Set env variables for google spreedsheet in the root of your project:

- Your service account's credentials file

```env
GOOGLE_CREDENTIAL_FILE_PATH=your_google_key_filename
```

- Worksheet name

```env
GOOGLE_WORKSHEET_NAME="sheet1"
```

- Google spreasheet ID. To extract the Google Sheet ID, find it in the URL between /d/ and /edit (e.g. 1A2B3C4D5E6F7G8H9I0J1K2L3M4N5O6P7Q8R9S0T1U2V).

```env
GOOGLE_SHEET_ID=sheet_id
```

## Running the Project

1. Start the server:

   ```bash
   godspeed serve
   ```

2. Access Swagger UI:

   ```
   http://localhost:3000/api-docs
   ```

3. Test email sending:
   - Send a mail using the data format provided in swagger UI
   - Check the spread sheet, you should be able to see the logs being updated on it.
   - Open the email on email app to see the **open** log getting update
   - Send any link in the html section of mail body using anchor tag, and click on that link in the email app to see the **click** log getting updated.

### env for testing purpose:

```
SENDGRID_API_KEY=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
SENDGRID_DEFAULT_SENDER="itsamrit26@gmail.com"

GOOGLE_SHEET_ID=13w9a9fwpGJDZ68husCHv2VU6rWtdGk7gtAxrIYTDxFc
GOOGLE_CREDENTIAL_FILE_PATH="google-key.json"
GOOGLE_WORKSHEET_NAME="Sheet1"

POSTGRES_URL=postgresql://postgres:postgres@172.23.0.2:5432/emp
MONGO_TEST_URL=mongodb://username:password@mongodb1,mongodb2,mongodb3:27017/test?replicaSet=gs_service
GS_TRANSPILE=true
```

### google-key.json for testing:

```
{
  "type": "service_account",
  "project_id": "godspeed-441316",
  "private_key_id": "2d3fbf5d56e53e41a87351cba74cb7a1a7401940",
  "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQCXr+b/Yh00LbsN\nURmzFNOoi7ccdJTMASjcmjjWyyf1cv1GtEzExNdCqz0F+7O4hCDJqGcRXVev+WLF\nUdvtLFM5E68be73MXVWWnCwDIL9JdlSM+nHZYv9YYY3rIWR6fsF+drWyprEmtMlc\nEsYwFZJhV7UiEb/TY8uGIlbukLeLzVcnozyyQUrLYg4K92qqPJlNVYPfs3H5Ucp6\nduPy5roTcqt73PSQogFL7nw+nwbIP9NvAN6wIzDBiutR7PNX1oA8i+Jynrzq4FWu\nsxKrOr4Vy92IOOH3TkyzPEzu/qqtNJYS0Tt9DBBEgb+DRVWEg7Ci/7ydSF3zvyuh\naLrtW5rtAgMBAAECggEAS4s4URINF1J7KOuuD+kcbIGApXROMreVISDRk+/Dq9Mj\n3pWm8gxSZIqhrpwnaoqrRaNQCW7iX+qkzT6yeBEuNWvfNqHO6bvGB2cp6Djj63M6\nMqf8EVbjcqHLK0ILJ5J/TTtTzHCGI4/ABNH40DO+HiqvNBOA5Id78gaiItgCAWZz\nZaWUydOcgO7JLyrg8z+rTY6bL+7eiP0RAbyzK+TzqXyoI/jkDXWsyitnsbgHZomK\nbq7VCbzF9owo3S4bVY1QNeD3J8JMr9zEGuY1/JjnkYiYBT14VsxKl1c6Wd+nm5GQ\n6TVIlncbQWIw3En0WbvF/u8E0kEkJJGVjiPoUhkgRQKBgQDIQkbC2wlQYogXbFYv\nJokmHljQW7W5JxIDwAsW2XO94zGi1AD4Q6WfYjQ4kR8dNfgStwsHo6V/5NIJGiZ9\nNtVXh4TaszbFYP0V7xocnaC4tYoIMc0MeY5xCiY+GslMc7/NJYhWsDVyaL/qI1fR\nzAh/lCgWaw9K4Fl/4hZvdg73dwKBgQDB6JPCr9F4cMdfppMdDL5TCiO/YN42INHB\n2+gilmqutUp46bxQVPj5+0uUZpsEpnAvhzAoYVGO+/AZCli8hKBDh6z46wMA5P4o\n70ZhDdJ17M8oqLnM6JA+5dWkht9qo4VUpIsyBywEfDSkl84y4aJrIfTiJhjt4n7u\n9ZwU6E2huwKBgDM/4uQTMjsEPFfiPdwrPIYo1gncrpEH0rBrAWuDkv9RmW5WWzkt\n9sDnXP3tBc1v9mCzv3rhAoXMhYQW0SrSUZ7o67MckjPJMnveiQwxuuQKcZzPQe6j\nXTTIqCjUqheKt9dEd7PXvJXfAN5m1R633KTpwaibFXrQF5eGwL8ds47ZAoGACyC+\nwhB28/N87ZdQn/0oOvm8/XGgrviJMRfepYV+T9JlmLTJMs79jtMGDlkpEkY+7+tR\nLzAOjycUK0u1tfPigp2ZpptOC9IYZ977afxyFIRniwzLxN+fz4w/C3cWATerIiVj\nO5a/xu4d00hG9BKQ0JcdR5EqIxS5dhswPt7p/ZsCgYAH2Eomsyws/SAfC1u2LAIH\nuIX4/0OFOCm1Cd2q4kMtDLCew9UG5ztA/ogPS0JU8bOx+uhHsbpEHAM6gkPVOOch\n8cLKgPCZJ5DEWwF5Ky+1OqsIJEplvQDl51hUJ8EkTERsIOCr1hTHS8xOjqmpnocG\nOa52LSgRL3kmWQwznLCZSQ==\n-----END PRIVATE KEY-----\n",
  "client_email": "godspeed@godspeed-441316.iam.gserviceaccount.com",
  "client_id": "107653088915220369293",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/godspeed%40godspeed-441316.iam.gserviceaccount.com",
  "universe_domain": "googleapis.com"
}
```

## Troubleshooting

Common issues and solutions:

1. **Webhook not receiving events**

   - Verify ngrok is running and URL is updated in SendGrid
   - Check webhook logs in SendGrid dashboard

2. **Google Sheets access denied**

   - Verify service account email is correctly shared
   - Check `google-key.json` permissions

3. **Emails not sending**

- Check spam folder
- Verify sender email is authenticated
- Check SendGrid API key permissions

## Security Best Practices

1. Never commit sensitive files:

   - Add to `.gitignore`:
     ```
     .env
     google-key.json
     ```

2. Use environment variables for all secrets

3. Restrict API key permissions when possible

## Contributing

We welcome contributions! Please:

1. Fork the repository
2. Create a feature branch
3. Submit a pull request

## Support

- Documentation: [Godspeed Docs](https://godspeed.systems/docs)
- Issues: Create a GitHub issue
- Community: Join our [Discord](https://discord.gg/JDjVeGJG)

# Thankyou for using godspeed💓
