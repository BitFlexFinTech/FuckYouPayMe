const fs=require("fs");
const p="src/lib/mock-data.ts";
const i=[ // invoices data using relative day offsets
{id:"inv-001",c:"INV-2026-0001",cn:"Nexus Studios",ce:"billing@nexus.com",sub:1250000,tot:1250000,cu:"USD",fp:2.5,fa:31250,fr:1218750,dd:14,idate:30,pd:25,s:"PAID",ds:0,dc:true,n:"Q3 Brand Strategy",its:[{d:"Brand Strategy",q:1,r:500000},{d:"Campaign Deck",q:1,r:450000},{d:"Social Kit",q:1,r:300000}]},
{id:"inv-002",c:"INV-2026-0002",cn:"Tangent Capital",ce:"accounts@tangentcap.com",sub:840000,tot:840000,cu:"USD",fp:2.5,fa:21000,fr:819000,dd:-5,idate:25,s:"OVERDUE",ds:2,dc:false,l:"fuck_you",nd:1,n:"Dashboard UI",its:[{d:"Dashboard UI Design",q:3,r:180000},{d:"Frontend Impl",q:1,r:300000}],dis:[{id:"dp1",cn:"Tangent Capital",ce:"accounts@tangentcap.com",r:"Amount does not match scope.",st:"OPEN",crat:10}]},
{id:"inv-003",c:"INV-2026-0003",cn:"Brutalist Systems",ce:"finance@brutalistsys.io",sub:320000,tot:320000,cu:"EUR",fp:2.5,fa:8000,fr:312000,dd:20,idate:20,s:"DUNNING_ACTIVE",ds:1,dc:false,l:"fuck_you",nd:2,n:"Component audit",its:[{d:"Component Audit",q:1,r:120000},{d:"Refactoring Sprint",q:1,r:200000}]},
{id:"inv-004",c:"INV-2026-0004",cn:"Oscura Ventures",ce:"ap@oscura.vc",sub:2200000,tot:2200000,cu:"USD",fp:2.5,fa:55000,fr:2145000,dd:30,idate:17,s:"SENT",ds:0,dc:false,l:"fuck_you",nd:3,n:"Full-stack platform MVP",its:[{d:"Architecture & Setup",q:1,r:400000},{d:"Backend API",q:1,r:900000},{d:"Frontend Dev",q:1,r:700000},{d:"Deployment",q:1,r:200000}]},
{id:"inv-005",c:"INV-2026-0005",cn:"ACME Corp",ce:"billing@acme.com",sub:550000,tot:550000,cu:"USD",fp:2.5,fa:13750,fr:536250,dd:45,idate:0,s:"DRAFT",n:"Website Redesign",its:[{d:"Wireframes",q:1,r:150000},{d:"Visual Design",q:1,r:250000},{d:"Mobile",q:1,r:150000}]}
];
// Generate TypeScript output
function q(s){return JSON.stringify(s);}
let out="import { addDays } from \"date-fns\";\n\nexport const MOCK_USER = {\n  id: \"demo-freelancer-1\", name: \"Maya Chen\",\n  email: \"maya@fuckyoupayme.online\", role: \"FREELANCER\",\n  onboarded: true, businessName: \"Chen Creative Studio\",\n  country: \"US\", currency: \"USD\",\n};\n\nexport const MOCK_ADMIN = {\n  id: \"demo-admin-1\", name: \"Platform Admin\",\n  email: \"admin@fuckyoupayme.online\", role: \"ADMIN\",\n  onboarded: true,\n};\n\nexport function getMockInvoices() {\n  const d = (a: number) => addDays(new Date(), -a).toISOString();\n  const f = (a: number) => addDays(new Date(), a).toISOString();\n  return [\n";

for (const inv of i) {
  const its = inv.its.map(it=>`{id:${q("i-"+it.d.slice(0,3).toLowerCase())},description:${q(it.d)},quantity:${it.q},rate:${it.r},amount:${it.q*it.r}}`).join(",");
  const dd = inv.dd > 0 ? `f(${inv.dd})` : `d(${Math.abs(inv.dd)})`;
  const idate = `d(${inv.idate})`;
  const paid = inv.pd !== undefined ? `d(${inv.pd})` : "null";
  const level = inv.l || "fuck_you";
  const next = inv.nd !== undefined ? `f(${inv.nd})` : "null";
  const ds = inv.ds !== undefined ? inv.ds : 0;
  const dc = inv.dc !== undefined ? inv.dc : false;
  const dis = inv.dis ? `disputes:[${inv.dis.map(di=>`{id:${q(di.id)},clientName:${q(di.cn)},clientEmail:${q(di.ce)},reason:${q(di.r)},status:${q(di.st)},createdAt:d(${di.crat})}`).join(",")}],` : "disputes:[],";
  out += `    {id:${q(inv.id)},invoiceNumber:${q(inv.c)},clientName:${q(inv.cn)},clientEmail:${q(inv.ce)},subtotal:${inv.sub},total:${inv.tot},currency:${q(inv.cu)},platformFeePercent:${inv.fp},platformFeeAmount:${inv.fa},freelancerReceives:${inv.fr},dueDate:${dd},issuedDate:${idate},paidDate:${paid},status:${q(inv.s)},dunningStage:${ds},dunningCompleted:${dc},dunningLevel:${q(level)},nextDunningDate:${next},notes:${q(inv.n)},items:[${its}],payments:[],dunningEvents:[],${dis}createdAt:${idate}},\n`;
}

out += `  ];
}

export function getMockClients() {
  return [
    {id:"c1",name:"Nexus Studios",email:"billing@nexus.com",company:"Nexus Studios Inc.",avgPaymentDays:5,invoicesPaid:3,totalInvoiced:3750000},
    {id:"c2",name:"Tangent Capital",email:"accounts@tangentcap.com",company:"Tangent Capital LLC",avgPaymentDays:18,invoicesPaid:2,totalInvoiced:1680000},
    {id:"c3",name:"Brutalist Systems",email:"finance@brutalistsys.io",company:"Brutalist Systems Ltd",avgPaymentDays:12,invoicesPaid:1,totalInvoiced:320000},
  ];
}

export function getMockPayments() {
  return [{id:"p1",invoiceId:"inv-001",amount:1250000,currency:"USD",method:"STRIPE_CARD",status:"PAID",platformFeeAmount:31250,createdAt:new Date().toISOString()}];
}

export function getMockDunningEvents() {
  return [
    {id:"de1",invoiceId:"inv-002",stage:0,level:"fuck_you",channel:"email",subject:"INV-2026-0002 for $8400",recipient:"accounts@tangentcap.com",sentAt:new Date().toISOString()},
    {id:"de2",invoiceId:"inv-002",stage:1,level:"fuck_you",channel:"email",subject:"Hey, you owe $8400",recipient:"accounts@tangentcap.com",sentAt:new Date().toISOString()},
    {id:"de3",invoiceId:"inv-002",stage:2,level:"fuck_you",channel:"email",subject:"This is awkward. $8400.",recipient:"accounts@tangentcap.com",sentAt:new Date().toISOString()},
    {id:"de4",invoiceId:"inv-003",stage:0,level:"fuck_you",channel:"email",subject:"INV-2026-0003 for $3200",recipient:"finance@brutalistsys.io",sentAt:new Date().toISOString()},
    {id:"de5",invoiceId:"inv-003",stage:1,level:"fuck_you",channel:"email",subject:"Hey, you owe $3200",recipient:"finance@brutalistsys.io",sentAt:new Date().toISOString()},
  ];
}

export function getMockUsers() {
  return [
    {id:"u1",name:"Maya Chen",email:"maya@fuckyoupayme.online",businessName:"Chen Creative Studio",country:"US",currency:"USD",onboarded:true,stripeAccountId:"acct_mock",createdAt:new Date().toISOString(),_count:{invoices:5,clients:4}},
    {id:"u2",name:"James Wilson",email:"james@example.com",businessName:"Wilson Design Co",country:"GB",currency:"GBP",onboarded:true,stripeAccountId:null,createdAt:new Date().toISOString(),_count:{invoices:3,clients:2}},
    {id:"u3",name:"Sarah Kim",email:"sarah@example.com",businessName:null,country:"CA",currency:"CAD",onboarded:false,stripeAccountId:null,createdAt:new Date().toISOString(),_count:{invoices:0,clients:0}},
  ];
}

export function getMockDisputes() {
  return [{id:"dp1",invoiceId:"inv-002",clientName:"Tangent Capital",clientEmail:"accounts@tangentcap.com",reason:"Amount does not match scope.",status:"OPEN",createdAt:new Date().toISOString()}];
}

export function isMockMode(): boolean {
  return !process.env.DATABASE_URL || process.env.DATABASE_URL.includes("localhost") || process.env.DATABASE_URL.includes("dummy");
}
`;

fs.writeFileSync(p, out);
console.log("Wrote " + out.length + " bytes");