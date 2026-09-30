import LegalPageLayout from '../components/LegalPageLayout';

export default function Cookies() {
  return (
    <LegalPageLayout title="Cookie Policy" lastUpdated="October 2026">
      <h2 className="text-xl font-bold text-eclipse-bright mt-8 mb-4">1. What Are Cookies?</h2>
      <p>
        Cookies are small text files stored on your device by your web browser when you visit a website. They are widely used to make websites work more efficiently and provide a better user experience.
      </p>

      <h2 className="text-xl font-bold text-eclipse-bright mt-8 mb-4">2. How EclipseID Uses Cookies & Local Storage</h2>
      <p>
        As a decentralized application (dApp), EclipseID heavily prioritizes your privacy. We intentionally minimize the use of traditional tracking cookies. Instead, we rely primarily on modern Web Storage (Local Storage and Session Storage) to manage necessary functional states.
      </p>

      <h2 className="text-xl font-bold text-eclipse-bright mt-8 mb-4">3. Types of Data We Store Locally</h2>
      <ul className="list-disc pl-5 space-y-2">
        <li><strong>Strictly Necessary Storage:</strong> We store minimal state data required to maintain your active wallet connection (e.g., Midnight Lace connector state) across page reloads. Without this, the dApp cannot function.</li>
        <li><strong>Zero-Knowledge Contexts:</strong> During proof generation, temporary cryptographic parameters may be held in your local session memory. This data is cleared when you close the tab.</li>
        <li><strong>UI Preferences:</strong> Simple preferences, such as dismissing notification banners or UI toggles, to improve your browsing experience.</li>
      </ul>

      <h2 className="text-xl font-bold text-eclipse-bright mt-8 mb-4">4. Third-Party Cookies</h2>
      <p>
        EclipseID does <strong>not</strong> use third-party tracking cookies, invasive analytics (like Google Analytics), or advertising pixels. We believe your on-chain and off-chain activities should remain completely private.
      </p>

      <h2 className="text-xl font-bold text-eclipse-bright mt-8 mb-4">5. Managing Your Storage</h2>
      <p>
        You have the right to control the data stored in your browser. You can clear your Local Storage, Session Storage, and Cookies at any time through your browser's developer tools or privacy settings. Please note that clearing this data will require you to reconnect your Midnight wallet upon your next visit.
      </p>
    </LegalPageLayout>
  );
}
