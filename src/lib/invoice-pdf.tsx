import React from "react";
import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: { padding: 40, fontSize: 10, fontFamily: "Helvetica", color: "#1a1a1a" },
  header: { flexDirection: "row", justifyContent: "space-between", marginBottom: 40, borderBottomWidth: 2, borderBottomColor: "#FF0080", paddingBottom: 20 },
  brand: { fontSize: 20, fontWeight: 700, color: "#FF0080", letterSpacing: -1 },
  tagline: { fontSize: 7, color: "#999", marginTop: 2, letterSpacing: 1 },
  invoiceMeta: { alignItems: "flex-end" },
  invoiceTitle: { fontSize: 16, fontWeight: 700 },
  invoiceNumber: { fontSize: 8, color: "#666", fontFamily: "Courier" },
  label: { fontSize: 7, color: "#999", textTransform: "uppercase", letterSpacing: 1, marginBottom: 4 },
  value: { fontSize: 10, color: "#1a1a1a", marginBottom: 2 },
  tableHeader: { flexDirection: "row", backgroundColor: "#f5f5f5", paddingVertical: 6, paddingHorizontal: 8, borderBottomWidth: 1, borderBottomColor: "#e0e0e0" },
  tableHeaderText: { fontSize: 7, fontWeight: 700, color: "#666", textTransform: "uppercase", letterSpacing: 1 },
  tableRow: { flexDirection: "row", paddingVertical: 6, paddingHorizontal: 8, borderBottomWidth: 1, borderBottomColor: "#f0f0f0" },
  tableCell: { fontSize: 9, color: "#1a1a1a" },
  col70: { width: "70%" },
  col10: { width: "10%", textAlign: "right" },
  col20: { width: "20%", textAlign: "right" },
  totals: { marginTop: 20, alignItems: "flex-end" },
  totalRow: { flexDirection: "row", paddingVertical: 3 },
  totalLabel: { fontSize: 9, color: "#666", width: 100, textAlign: "right", marginRight: 10 },
  totalValue: { fontSize: 9, color: "#1a1a1a", fontFamily: "Courier", width: 80, textAlign: "right" },
  grandTotalRow: { flexDirection: "row", paddingVertical: 5, borderTopWidth: 2, borderTopColor: "#1a1a1a", marginTop: 5 },
  grandTotalLabel: { fontSize: 11, fontWeight: 700, width: 100, textAlign: "right", marginRight: 10 },
  grandTotalValue: { fontSize: 11, fontWeight: 700, color: "#FF0080", fontFamily: "Courier", width: 80, textAlign: "right" },
  footer: { position: "absolute", bottom: 30, left: 40, right: 40, borderTopWidth: 1, borderTopColor: "#e0e0e0", paddingTop: 10, flexDirection: "row", justifyContent: "space-between" },
  footerText: { fontSize: 7, color: "#999", fontFamily: "Courier" },
  paymentLink: { marginTop: 20, padding: 10, backgroundColor: "#FF0080", fontSize: 10, fontWeight: 700, textAlign: "center" },
});

export function InvoicePdfDocument({ invoice, freelancerName, businessName }: any) {
  const fmt = (c: number) => "$" + (c / 100).toFixed(2);
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <View>
            <Text style={styles.brand}>FYPM</Text>
            <Text style={styles.tagline}>FUCKYOUPAYME.ONLINE</Text>
          </View>
          <View style={styles.invoiceMeta}>
            <Text style={styles.invoiceTitle}>INVOICE</Text>
            <Text style={styles.invoiceNumber}>{invoice.invoiceNumber}</Text>
          </View>
        </View>
        <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 20 }}>
          <View><Text style={styles.label}>From</Text><Text style={styles.value}>{businessName || freelancerName || "Freelancer"}</Text></View>
          <View><Text style={styles.label}>Bill To</Text><Text style={styles.value}>{invoice.clientName}</Text></View>
        </View>
        <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 20 }}>
          <View><Text style={styles.label}>Due</Text><Text style={styles.value}>{new Date(invoice.dueDate).toLocaleDateString()}</Text></View>
          <View><Text style={styles.label}>Currency</Text><Text style={styles.value}>{invoice.currency}</Text></View>
        </View>
        <View>
          <View style={styles.tableHeader}>
            <Text style={[styles.tableHeaderText, styles.col70]}>Description</Text>
            <Text style={[styles.tableHeaderText, styles.col10]}>Qty</Text>
            <Text style={[styles.tableHeaderText, styles.col20]}>Amount</Text>
          </View>
          {invoice.items?.map((item: any, i: number) => (
            <View key={i} style={styles.tableRow}>
              <Text style={[styles.tableCell, styles.col70]}>{item.description}</Text>
              <Text style={[styles.tableCell, styles.col10]}>{item.quantity}</Text>
              <Text style={[styles.tableCell, styles.col20]}>{fmt(item.amount)}</Text>
            </View>
          ))}
        </View>
        <View style={styles.totals}>
          <View style={styles.totalRow}><Text style={styles.totalLabel}>Subtotal</Text><Text style={styles.totalValue}>{fmt(invoice.subtotal)}</Text></View>
          <View style={styles.grandTotalRow}><Text style={styles.grandTotalLabel}>Total Due</Text><Text style={styles.grandTotalValue}>{fmt(invoice.total)}</Text></View>
        </View>
        <View style={styles.footer}><Text style={styles.footerText}>Invoice {invoice.invoiceNumber}</Text><Text style={styles.footerText}>Powered by FuckYouPayMe</Text></View>
      </Page>
    </Document>
  );
}