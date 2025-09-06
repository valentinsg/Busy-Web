export const metadata = {
  title: "Terms of Service - Busy",
  description: "Read our terms of service and conditions for using Busy products and services.",
}

export default function TermsPage() {
  return (
    <div className="container px-4 py-8 pt-20">
      <div className="max-w-4xl mx-auto prose prose-neutral dark:prose-invert">
        <h1>Terms of Service</h1>
        <p className="text-muted-foreground">Last updated: January 15, 2025</p>

        <h2>Acceptance of Terms</h2>
        <p>
          By accessing and using this website, you accept and agree to be bound by the terms and provision of this
          agreement.
        </p>

        <h2>Products and Services</h2>
        <p>
          All products and services are subject to availability. We reserve the right to discontinue any product at any
          time.
        </p>

        <h2>Pricing and Payment</h2>
        <p>
          All prices are subject to change without notice. Payment must be received in full before products are shipped.
        </p>

        <h2>Shipping and Returns</h2>
        <p>
          Shipping times and costs vary by location. Returns are accepted within 30 days of purchase in original
          condition.
        </p>

        <h2>Limitation of Liability</h2>
        <p>
          Busy shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting
          from your use of our products or services.
        </p>

        <h2>Contact Information</h2>
        <p>
          Questions about the Terms of Service should be sent to us at{" "}
          <a href="mailto:legal@busy.com">legal@busy.com</a>.
        </p>
      </div>
    </div>
  )
}
