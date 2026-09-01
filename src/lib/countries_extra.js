const fs = require('fs');
const f = 'countries.ts';
let s = fs.readFileSync(f, 'utf8');

// Get the end of the file before the closing ]
s = s.replace(
  'export const COUNTRIES: CountryConfig[] = [];',
  'export const COUNTRIES: CountryConfig[] = [\\n' + 
  '  mkC("DE","Germany","🇩🇪","Deutsch","de-DE","EUR","€",[{method:"sepa",label:"SEPA Instant",icon:"🏦",instant:true,maxAmount:100000,setupFields:[{key:"iban",label:"IBAN",type:"text",placeholder:"DE89 3704 0044 0532 0130 00"},{key:"holder",label:"Kontoinhaber",type:"text",placeholder:"Max Mustermann"}]},{method:"wise",label:"Wise",icon:"🌍",instant:false,maxAmount:50000,setupFields:[{key:"email",label:"Wise Email",type:"text",placeholder:"meine@email.de"}]}],{h1:"FICK DICH.",h2:"ZAHL MICH."},"Welcome"),' +
  '];'
);
fs.writeFileSync(f, s);
console.log('done');
