export const metadata = {
  title: "Privacy Policy - Busy",
  description: "Learn how Busy collects, uses, and protects your personal information.",
}

export default function PrivacyPage() {
  return (
    <div className="container px-4 py-8 pt-20">
      <div className="max-w-4xl mx-auto prose prose-neutral dark:prose-invert">
        <h1>Privacy Policy</h1>
        <p className="text-muted-foreground">Last updated: January 15, 2025</p>

        <h2>Information We Collect</h2>
        <p>
          We collect information you provide directly to us, such as when you create an account, make a purchase, or
          contact us for support.
        </p>

        <h2>How We Use Your Information</h2>
        <p>We use the information we collect to:</p>
        <ul>
          <li>Process and fulfill your orders</li>
          <li>Communicate with you about your account or transactions</li>
          <li>Provide customer support</li>
          <li>Send you marketing communications (with your consent)</li>
          <li>Improve our products and services</li>
        </ul>

        <h2>Information Sharing</h2>
        <p>
          We do not sell, trade, or otherwise transfer your personal information to third parties without your consent,
          except as described in this policy.
        </p>

        <h2>Data Security</h2>
        <p>
          We implement appropriate security measures to protect your personal information against unauthorized access,
          alteration, disclosure, or destruction.
        </p>

        <h2>Contact Us</h2>
        <p>
          If you have any questions about this Privacy Policy, please contact us at{" "}
          <a href="mailto:privacy@busy.com">privacy@busy.com</a>.
        </p>
      </div>
    </div>
  )
}
