import { Button } from "@/components/ui/button";
import { Printer, FileSpreadsheet, FileText, Search } from "lucide-react";
import { Input } from "@/components/ui/input";

export function ReportToolbar({
  title,
  children,
  onPrint,
  onExcel,
  onPdf,
  search,
  onSearch,
}: {
  title: string;
  children?: React.ReactNode;
  onPrint?: () => void;
  onExcel?: () => void;
  onPdf?: () => void;
  search?: string;
  onSearch?: (v: string) => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2 no-print">
      <h1 className="text-xl font-bold mr-auto">{title}</h1>
      {onSearch && (
        <div className="relative">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search..."
            value={search || ""}
            onChange={(e) => onSearch(e.target.value)}
            className="w-52 pl-8 h-9"
          />
        </div>
      )}
      {children}
      {onPrint && (
        <Button size="sm" variant="outline" onClick={onPrint}>
          <Printer className="h-4 w-4 mr-1" />Print
        </Button>
      )}
      {onExcel && (
        <Button size="sm" variant="outline" onClick={onExcel}>
          <FileSpreadsheet className="h-4 w-4 mr-1" />Excel
        </Button>
      )}
      {onPdf && (
        <Button size="sm" variant="outline" onClick={onPdf}>
          <FileText className="h-4 w-4 mr-1" />PDF
        </Button>
      )}
    </div>
  );
}

export function ReportHeader({
  title,
  from,
  to,
  company,
  gstin,
}: {
  title: string;
  from?: string;
  to?: string;
  company: string;
  gstin: string;
}) {
  return (
    <div className="border-2 border-foreground/70 bg-card">
      <div className="text-center py-1.5 border-b border-foreground/70 text-[13px] font-semibold">
        {company}
      </div>
      <div className="text-center py-1 border-b border-foreground/70 text-[12px]">
        GST TIN: {gstin}
      </div>
      <div className="text-center py-1 border-b border-foreground/70 text-[13px] font-bold tracking-wide">
        {title}
      </div>
      {(from || to) && (
        <div className="flex justify-between px-3 py-1 text-[11px] font-mono">
          <span>From Date*: {from}</span>
          <span>To Date*: {to}</span>
        </div>
      )}
    </div>
  );
}
