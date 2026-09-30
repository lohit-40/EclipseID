import LegalPageLayout from '../components/LegalPageLayout';

export default function Disclaimer() {
  return (
    <LegalPageLayout title="Web3 & Protocol Disclaimer" lastUpdated="October 2026">
      <div className="bg-eclipse-pink/10 border border-eclipse-pink/20 rounded-xl p-6 mb-8">
        <h2 className="text-xl font-bold text-eclipse-pink mb-2">Important Notice</h2>
        <p className="text-eclipse-bright font-medium">
          Please read this disclaimer carefully before interacting with the EclipseID Protocol or the underlying Midnight Network smart contracts.
        </p>
      </div>

      <h2 className="text-xl font-bold text-eclipse-bright mt-8 mb-4">1. Experimental Technology</h2>
      <p>
        EclipseID utilizes advanced Zero-Knowledge (ZK) cryptography, smart contracts, and decentralized network infrastructure. While we adhere to rigorous engineering standards, this technology is experimental. There are inherent risks associated with using blockchain protocols, including but not limited to bugs, vulnerabilities, network congestion, and potential loss of cryptographic keys.
      </p>

      <h2 className="text-xl font-bold text-eclipse-bright mt-8 mb-4">2. No Financial Advice</h2>
      <p>
        Nothing provided through the EclipseID interface constitutes financial, legal, or investment advice. The protocol is an identity verification tool. Any interactions you have with third-party DeFi applications (such as Darkpools) using your EclipseID credentials are done entirely at your own risk.
      </p>

      <h2 className="text-xl font-bold text-eclipse-bright mt-8 mb-4">3. Midnight Network Dependency</h2>
      <p>
        EclipseID operates on the public Midnight Network. We do not control the validators, node operators, or the consensus mechanism of this blockchain. If the Midnight Network experiences downtime, forks, or consensus failures, EclipseID's services may be temporarily or permanently disrupted. We are not liable for any losses arising from such network-level events.
      </p>

      <h2 className="text-xl font-bold text-eclipse-bright mt-8 mb-4">4. "As Is" Basis</h2>
      <p>
        The EclipseID software, interfaces, and smart contracts are provided on an "AS IS" and "AS AVAILABLE" basis, without warranties of any kind, either express or implied, including, without limitation, implied warranties of merchantability, fitness for a particular purpose, or non-infringement.
      </p>

      <h2 className="text-xl font-bold text-eclipse-bright mt-8 mb-4">5. Regulatory Uncertainty</h2>
      <p>
        The regulatory landscape surrounding blockchain technology, privacy coins, and Zero-Knowledge proofs is constantly evolving. You are solely responsible for ensuring that your use of EclipseID complies with the laws and regulations in your jurisdiction.
      </p>
    </LegalPageLayout>
  );
}
