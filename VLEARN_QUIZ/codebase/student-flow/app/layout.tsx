import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "VLearn Quiz AI — Student Flow",
  description:
    "Student flow prototype — chọn buổi học, làm quiz, xem kết quả và bản đồ lỗ hổng kiến thức.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi">
      <body>{children}</body>
    </html>
  );
}
