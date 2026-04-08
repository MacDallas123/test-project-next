import Footer from "@/components/partials/Footer";

export default function LayoutWithFooter({ children }) {
  return (
    <>
      {children}
      <Footer />
    </>
  );
}
