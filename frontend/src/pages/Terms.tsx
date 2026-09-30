import LegalPageLayout from '../components/LegalPageLayout';

export default function Terms() {
  return (
    <LegalPageLayout title="Terms of Service" lastUpdated="October 2026">
      <h2 className="text-xl font-bold text-eclipse-bright mt-8 mb-4">1. Acceptance of Terms</h2>
      <p>
        By accessing or using the EclipseID web interface, smart contracts, or associated infrastructure (collectively, the "Protocol"), you agree to be bound by these Terms of Service. If you do not agree to these terms, you may not use the Protocol.
      </p>

      <h2 className="text-xl font-bold text-eclipse-bright mt-8 mb-4">2. Description of the Protocol</h2>
      <p>
        EclipseID is a decentralized, Zero-Knowledge identity protocol deployed on the Midnight Network. It provides cryptographic tools allowing users to generate proofs of identity attributes locally without exposing raw Personally Identifiable Information (PII) to public ledgers or third-party dApps.
      </p>

      <h2 className="text-xl font-bold text-eclipse-bright mt-8 mb-4">3. User Responsibilities</h2>
      <p>
        You are solely responsible for the security of your Midnight Network wallet (e.g., Lace, 1AM) and your private keys. EclipseID cannot recover lost funds, tokens, or identity credentials if your wallet is compromised. You agree not to use the Protocol for any illegal, fraudulent, or malicious activities.
      </p>

      <h2 className="text-xl font-bold text-eclipse-bright mt-8 mb-4">4. Decentralized Infrastructure</h2>
      <p>
        The EclipseID smart contracts run on the public Midnight Network. We do not control the underlying blockchain, network validators, or finality of transactions. You acknowledge that transaction speeds, costs, and availability are subject to network conditions beyond our control.
      </p>

      <h2 className="text-xl font-bold text-eclipse-bright mt-8 mb-4">5. Intellectual Property</h2>
      <p>
        The EclipseID frontend interface, logos, and original content are the property of the EclipseID core contributors. The underlying smart contract code and cryptography are open-source and subject to their respective open-source licenses (e.g., MIT, Apache 2.0).
      </p>

      <h2 className="text-xl font-bold text-eclipse-bright mt-8 mb-4">6. Limitation of Liability</h2>
      <p>
        To the maximum extent permitted by law, EclipseID and its contributors shall not be liable for any indirect, incidental, special, consequential, or punitive damages, or any loss of profits or revenues, whether incurred directly or indirectly, or any loss of data, use, goodwill, or other intangible losses resulting from your use of the Protocol.
      </p>

      <h2 className="text-xl font-bold text-eclipse-bright mt-8 mb-4">7. Changes to Terms</h2>
      <p>
        We reserve the right to modify these Terms at any time. We will notify users of significant changes by updating the "Last Updated" date on this page. Your continued use of the Protocol after such modifications constitutes your acceptance of the revised Terms.
      </p>
    </LegalPageLayout>
  );
}
