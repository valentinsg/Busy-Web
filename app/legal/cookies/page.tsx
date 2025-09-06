export const metadata = {
  title: "Cookie Policy - Busy",
  description: "Learn about how Busy uses cookies and similar technologies on our website.",
}

export default function CookiesPage() {
  return (
    <div className="container px-4 py-8">
      <div className="max-w-4xl mx-auto prose prose-neutral dark:prose-invert">
        <h1>Cookie Policy</h1>
        <p className="text-muted-foreground">Last updated: January 15, 2025</p>

        <h2>What Are Cookies</h2>
        <p>
          Cookies are small text files that are placed on your computer or mobile device when you visit our website.
        </p>

        <h2>How We Use Cookies</h2>
        <p>We use cookies to:</p>
        <ul>
          <li>Remember your preferences and settings</li>
          <li>Keep you signed in to your account</li>
          <li>Analyze how you use our website</li>
          <li>Provide personalized content and advertisements</li>
        </ul>

        <h2>Types of Cookies We Use</h2>
        <h3>Essential Cookies</h3>
        <p>These cookies are necessary for the website to function properly.</p>

        <h3>Analytics Cookies</h3>
        <p>These cookies help us understand how visitors interact with our website.</p>

        <h3>Marketing Cookies</h3>
        <p>These cookies are used to deliver relevant advertisements to you.</p>

        <h2>Managing Cookies</h2>
        <p>
          You can control and/or delete cookies as you wish. You can delete all cookies that are already on your
          computer and you can set most browsers to prevent them from being placed.
        </p>

        <h2>Contact Us</h2>
        <p>
          If you have any questions about our use of cookies, please contact us at{" "}
          <a href="mailto:privacy@busy.com">privacy@busy.com</a>.
        </p>
      </div>
    </div>
  )
}
