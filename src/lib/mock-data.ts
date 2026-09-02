import { addDays } from "date-fns";

export const MOCK_USER = {
  id: "demo-freelancer-1", name: "Maya Chen",
  email: "maya@fuckyoupayme.online", role: "FREELANCER",
  onboarded: true, businessName: "Chen Creative Studio",
  country: "US", currency: "USD",
};

export const MOCK_ADMIN = {
  id: "demo-admin-1", name: "Platform Admin",
  email: "admin@fuckyoupayme.online", role: "ADMIN",
  onboarded: true,
};

export function getMockInvoices() {
  const d = (a: number) => addDays(new Date(), -a).toISOString();
  const f = (a: number) => addDays(new Date(), a).toISOString();
  return [
    {id:"inv-001",invoiceNumber:"INV-2026-0001",clientName:"Nexus Studios",clientEmail:"billing@nexus.com",subtotal:1250000,total:1250000,currency:"USD",platformFeePercent:2.5,platformFeeAmount:31250,freelancerReceives:1218750,dueDate:f(14),issuedDate:d(30),paidDate:d(25),status:"PAID",dunningStage:0,dunningCompleted:true,dunningLevel:"fuck_you",nextDunningDate:null,notes:"Q3 Brand Strategy",items:[{id:"i-bra",description:"Brand Strategy",quantity:1,rate:500000,amount:500000},{id:"i-cam",description:"Campaign Deck",quantity:1,rate:450000,amount:450000},{id:"i-soc",description:"Social Kit",quantity:1,rate:300000,amount:300000}],payments:[],dunningEvents:[],disputes:[],createdAt:d(30)},
    {id:"inv-002",invoiceNumber:"INV-2026-0002",clientName:"Tangent Capital",clientEmail:"accounts@tangentcap.com",subtotal:840000,total:840000,currency:"USD",platformFeePercent:2.5,platformFeeAmount:21000,freelancerReceives:819000,dueDate:d(5),issuedDate:d(25),paidDate:null,status:"OVERDUE",dunningStage:2,dunningCompleted:false,dunningLevel:"fuck_you",nextDunningDate:f(1),notes:"Dashboard UI",items:[{id:"i-das",description:"Dashboard UI Design",quantity:3,rate:180000,amount:540000},{id:"i-fro",description:"Frontend Impl",quantity:1,rate:300000,amount:300000}],payments:[],dunningEvents:[],disputes:[{id:"dp1",clientName:"Tangent Capital",clientEmail:"accounts@tangentcap.com",reason:"Amount does not match scope.",status:"OPEN",createdAt:d(10)}],createdAt:d(25)},
    {id:"inv-003",invoiceNumber:"INV-2026-0003",clientName:"Brutalist Systems",clientEmail:"finance@brutalistsys.io",subtotal:320000,total:320000,currency:"EUR",platformFeePercent:2.5,platformFeeAmount:8000,freelancerReceives:312000,dueDate:f(20),issuedDate:d(20),paidDate:null,status:"DUNNING_ACTIVE",dunningStage:1,dunningCompleted:false,dunningLevel:"fuck_you",nextDunningDate:f(2),notes:"Component audit",items:[{id:"i-com",description:"Component Audit",quantity:1,rate:120000,amount:120000},{id:"i-ref",description:"Refactoring Sprint",quantity:1,rate:200000,amount:200000}],payments:[],dunningEvents:[],disputes:[],createdAt:d(20)},
    {id:"inv-004",invoiceNumber:"INV-2026-0004",clientName:"Oscura Ventures",clientEmail:"ap@oscura.vc",subtotal:2200000,total:2200000,currency:"USD",platformFeePercent:2.5,platformFeeAmount:55000,freelancerReceives:2145000,dueDate:f(30),issuedDate:d(17),paidDate:null,status:"SENT",dunningStage:0,dunningCompleted:false,dunningLevel:"fuck_you",nextDunningDate:f(3),notes:"Full-stack platform MVP",items:[{id:"i-arc",description:"Architecture & Setup",quantity:1,rate:400000,amount:400000},{id:"i-bac",description:"Backend API",quantity:1,rate:900000,amount:900000},{id:"i-fro",description:"Frontend Dev",quantity:1,rate:700000,amount:700000},{id:"i-dep",description:"Deployment",quantity:1,rate:200000,amount:200000}],payments:[],dunningEvents:[],disputes:[],createdAt:d(17)},
    {id:"inv-005",invoiceNumber:"INV-2026-0005",clientName:"ACME Corp",clientEmail:"billing@acme.com",subtotal:550000,total:550000,currency:"USD",platformFeePercent:2.5,platformFeeAmount:13750,freelancerReceives:536250,dueDate:f(45),issuedDate:d(0),paidDate:null,status:"DRAFT",dunningStage:0,dunningCompleted:false,dunningLevel:"fuck_you",nextDunningDate:null,notes:"Website Redesign",items:[{id:"i-wir",description:"Wireframes",quantity:1,rate:150000,amount:150000},{id:"i-vis",description:"Visual Design",quantity:1,rate:250000,amount:250000},{id:"i-mob",description:"Mobile",quantity:1,rate:150000,amount:150000}],payments:[],dunningEvents:[],disputes:[],createdAt:d(0)},
  ];
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
