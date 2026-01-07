export const buildResetPasswordEmail = (resetLink) => `
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Reset Your Cosmo-ticks Password</title>
    <style>
      /* Palette tuned to the reference */
      :root {
        --bg: #fbf4eb;
        --card: #ffffff;
        --border: #e9dfd3;
        --ink: #7a5a3a;
        --title: #8c6239;
        --muted: #8c7b6c;
        --cta-bg: #f6ede3;
        --note-bg: #f6ede3;
        --button: #8b5a3a;
        --button-hover: #7a4e32;
        --footer: #a18f7d;
      }

      body {
        margin: 0;
        padding: 0;
        background: var(--bg);
        font-family: 'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
        color: var(--ink);
        line-height: 1.6;
      }

      a { color: inherit; text-decoration: none; }

      .container {
        width: 100%;
        min-height: 100vh;
        padding: 32px 12px;
        box-sizing: border-box;
        background: var(--bg);
      }

      .card {
        max-width: 520px;
        margin: 0 auto;
        background: var(--card);
        border-radius: 14px;
        box-shadow: 0 14px 40px rgba(0, 0, 0, 0.06);
        border: 1px solid var(--border);
        overflow: hidden;
      }

      .header {
        padding: 20px 24px 18px;
        text-align: center;
        background: var(--card);
        border-bottom: 1px solid var(--border);
      }

      .brand-logo {
        font-size: 26px;
        font-weight: 800;
        color: var(--title);
        margin: 0 0 6px;
      }

      .tagline {
        margin: 0;
        color: #c59c71;
        font-size: 12px;
        letter-spacing: 0.8px;
        text-transform: uppercase;
        font-weight: 600;
      }

      .content {
        padding: 28px 26px 32px;
      }

      .title {
        font-family: 'Playfair Display', Georgia, serif;
        font-size: 22px;
        margin: 0 0 14px;
        color: var(--title);
      }

      .lead {
        font-size: 14px;
        line-height: 1.7;
        color: #7d6b58;
        margin: 0 0 12px;
      }

      .lead strong { color: #4f3b29; }

      .cta-section {
        background: var(--cta-bg);
        border: 1px solid #ecdccf;
        border-radius: 10px;
        padding: 24px 18px;
        margin: 22px 0 24px;
        text-align: center;
      }

      .cta-text {
        font-size: 14px;
        color: var(--title);
        font-weight: 600;
        margin: 0 0 18px;
      }

      .button {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        background: var(--button);
        color: #fff !important;
        padding: 12px 20px;
        border-radius: 10px;
        font-weight: 700;
        font-size: 14px;
        box-shadow: 0 10px 20px rgba(139, 90, 58, 0.25);
        border: none;
      }

      .button:hover { background: var(--button-hover); }

      .button-icon { font-size: 16px; }

      .link-box {
        background: var(--cta-bg);
        border: 1px solid #ecdccf;
        border-radius: 10px;
        padding: 18px;
        margin: 0 0 18px;
      }

      .link-label {
        font-size: 11px;
        font-weight: 700;
        color: #b08968;
        margin: 0 0 8px;
        letter-spacing: 0.8px;
        text-transform: uppercase;
      }

      .link {
        word-break: break-all;
        color: var(--ink);
        font-size: 12px;
        font-family: 'SF Mono', 'Monaco', 'Inconsolata', 'Fira Code', monospace;
        margin: 0;
      }

      .note {
        background: var(--note-bg);
        border: 1px solid #ecdccf;
        border-radius: 10px;
        padding: 14px 16px;
        margin: 0;
        color: #7f6f61;
        font-size: 13px;
        line-height: 1.6;
      }

      .footer {
        padding: 18px 20px 22px;
        background: var(--card);
        border-top: 1px solid var(--border);
        color: var(--footer);
        font-size: 12px;
        text-align: center;
      }

      .footer-links {
        margin-top: 10px;
        display: flex;
        justify-content: center;
        gap: 18px;
        flex-wrap: wrap;
      }

      .footer-link {
        color: #8c7b6c;
        font-weight: 500;
        font-size: 12px;
      }

      @media (max-width: 520px) {
        .card { margin: 0 4px; }
        .content { padding: 24px 18px 26px; }
        .cta-section { padding: 20px 14px; }
      }
    </style>
    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&family=Playfair+Display:wght@700;800&display=swap" rel="stylesheet">
  </head>
  <body>
    <div class="container">
      <div class="card">
        <div class="header">
          <div class="brand-logo">Cosmo ticks</div>
          <p class="tagline">EXPLORE THE UNIVERSE</p>
        </div>

        <div class="content">
          <h1 class="title">Password Reset Request</h1>

          <p class="lead">
            We received a request to reset the password for your Cosmo-ticks account.
            Click the button below to create a new secure password.
          </p>

          <p class="lead">
            For security reasons, this reset link will expire in <strong>1 hour</strong>.
          </p>

          <div class="cta-section">
            <p class="cta-text">Ready to continue your cosmic journey?</p>
            <button class="button" href="${resetLink}" target="_blank" rel="noopener" style="background: var(--button);">
              <span class="button-icon">🔒</span>
              Reset Password
            </button>
          </div>

          <div class="link-box">
            <div class="link-label">Alternative Method</div>
            <p class="link">${resetLink}</p>
          </div>

          <p class="note">
            If you didn't request this password reset, you can safely ignore this email.
            Your password will remain unchanged and your account secure.
          </p>
        </div>

        <div class="footer">
          <div>© ${new Date().getFullYear()} Cosmo-ticks. All rights reserved.</div>

          <div class="footer-links">
            <a href="#" class="footer-link">Help Center</a>
            <a href="#" class="footer-link">Privacy Policy</a>
            <a href="#" class="footer-link">Terms of Service</a>
            <a href="#" class="footer-link">Contact Support</a>
          </div>
        </div>
      </div>
    </div>
  </body>
</html>
`;
