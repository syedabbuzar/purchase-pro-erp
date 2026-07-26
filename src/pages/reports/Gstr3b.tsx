import { Card } from "@/components/ui/card";
import { ReportHeader, ReportToolbar } from "@/components/report-shell";
import { gstCompany, gstr3B } from "@/lib/gst-mock";
import { inr } from "@/lib/num";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="bg-muted/60 border border-foreground/40 px-2 py-1 text-[12px] font-semibold">{title}</div>
      <div className="overflow-x-auto">{children}</div>
    </div>
  );
}

const cell = "border border-foreground/40 px-2 py-1 text-[11px]";
const num = `${cell} text-right tabular-nums`;

function Gstr3B() {
  const [from, to] = gstr3B.period.split(" - ");
  return (
    <div className="space-y-3">
      <ReportToolbar
        title="GSTR-3B Summary"
        onPrint={() => window.print()}
        onExcel={() => { /* UI only */ }}
        onPdf={() => window.print()}
      />

      <div className="print-area space-y-2 font-mono">
        <ReportHeader
          title="FORM GSTR-3B"
          company={`${gstCompany.arn}-${gstCompany.name}`}
          gstin={`${gstCompany.gstin}/${gstCompany.stateCode}-${gstCompany.state}`}
          from={from}
          to={to}
        />

        <Card className="p-0">
          <Section title="3.1 Details of Outward Supplies and inward supplies liable to reverse charge">
            <table className="w-full border-collapse">
              <thead className="bg-primary text-primary-foreground">
                <tr>
                  <th className={`${cell} w-10`}>slno</th>
                  <th className={cell}>Nature Of Supplies</th>
                  <th className={num}>Total Taxable</th>
                  <th className={num}>Integrated</th>
                  <th className={num}>Central</th>
                  <th className={num}>State/UT Tax</th>
                  <th className={num}>Cess</th>
                </tr>
              </thead>
              <tbody>
                {gstr3B.outward.map((r) => (
                  <tr key={r.sl} className="even:bg-muted/30">
                    <td className={cell}>{r.sl}</td>
                    <td className={cell}>{r.nature}</td>
                    <td className={num}>{inr(r.taxable)}</td>
                    <td className={num}>{inr(r.integrated)}</td>
                    <td className={num}>{inr(r.central)}</td>
                    <td className={num}>{inr(r.state)}</td>
                    <td className={num}>{inr(r.cess)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Section>

          <Section title="3.2 Of the supplies shown in 3.1(a) above, details of inter-state supplies made to unregistered person, composition taxable person and UIN holders">
            <table className="w-full border-collapse">
              <thead className="bg-primary text-primary-foreground">
                <tr>
                  <th className={`${cell} w-10`}>slno</th>
                  <th className={cell}>Nature Of Supplies</th>
                  <th className={cell}>Place of supply (State/UT)</th>
                  <th className={num}>Total Taxable Value</th>
                  <th className={num}>Amount of Integrated</th>
                </tr>
              </thead>
              <tbody>
                {gstr3B.interstate.map((r) => (
                  <tr key={r.sl} className="even:bg-muted/30">
                    <td className={cell}>{r.sl}</td>
                    <td className={cell}>{r.nature}</td>
                    <td className={cell}>{r.pos}</td>
                    <td className={num}>{inr(r.taxable)}</td>
                    <td className={num}>{inr(r.igst)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Section>

          <Section title="4 Eligible ITC">
            <table className="w-full border-collapse">
              <thead className="bg-primary text-primary-foreground">
                <tr>
                  <th className={`${cell} w-10`}>slno</th>
                  <th className={cell}>Details</th>
                  <th className={num}>Integrated Tax</th>
                  <th className={num}>Central Tax</th>
                  <th className={num}>State/UT Tax</th>
                  <th className={num}>Cess</th>
                </tr>
              </thead>
              <tbody>
                {gstr3B.itc.map((r) => (
                  <tr key={r.sl} className={r.group ? "bg-muted/60 font-semibold" : "even:bg-muted/30"}>
                    <td className={cell}>{r.sl}</td>
                    <td className={cell}>{r.label}</td>
                    <td className={num}>{inr(r.integrated)}</td>
                    <td className={num}>{inr(r.central)}</td>
                    <td className={num}>{inr(r.state)}</td>
                    <td className={num}>{inr(r.cess)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Section>

          <Section title="5 Values of exempt, nil-rated and non-GST inward supplies">
            <table className="w-full border-collapse">
              <thead className="bg-primary text-primary-foreground">
                <tr>
                  <th className={`${cell} w-10`}>slno</th>
                  <th className={cell}>Nature Of Supplies</th>
                  <th className={num}>Inter-State Supplies</th>
                  <th className={num}>Intra-state Supplies</th>
                </tr>
              </thead>
              <tbody>
                {gstr3B.exempt.map((r) => (
                  <tr key={r.sl} className="even:bg-muted/30">
                    <td className={cell}>{r.sl}</td>
                    <td className={cell}>{r.nature}</td>
                    <td className={num}>{inr(r.inter)}</td>
                    <td className={num}>{inr(r.intra)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Section>

          <Section title="6.1 Payment of tax">
            <table className="w-full border-collapse">
              <thead className="bg-primary text-primary-foreground">
                <tr>
                  <th className={`${cell} w-10`}>slno</th>
                  <th className={cell}>Description</th>
                  <th className={num}>Tax Payable</th>
                  <th className={num}>ITC Integrated</th>
                  <th className={num}>ITC Central</th>
                  <th className={num}>ITC State/UT</th>
                  <th className={num}>ITC Cess</th>
                  <th className={num}>Tax Paid</th>
                  <th className={num}>Interest</th>
                  <th className={num}>Late Fee</th>
                </tr>
              </thead>
              <tbody>
                {gstr3B.payment.map((r) => (
                  <tr key={r.sl} className="even:bg-muted/30">
                    <td className={cell}>{r.sl}</td>
                    <td className={cell}>{r.desc}</td>
                    <td className={num}>{inr(r.payable)}</td>
                    <td className={num}>{inr(r.itcInt)}</td>
                    <td className={num}>{inr(r.itcCen)}</td>
                    <td className={num}>{inr(r.itcState)}</td>
                    <td className={num}>{inr(r.itcCess)}</td>
                    <td className={num}>{inr(r.taxPaid)}</td>
                    <td className={num}>{inr(r.interest)}</td>
                    <td className={num}>{inr(r.lateFee)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Section>
        </Card>
      </div>
    </div>
  );
}

export default Gstr3B;
