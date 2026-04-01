const fs = require('fs');
const file = 'c:/Users/DELL/Desktop/DevelopersHub/Ecommerse/frontend/src/pages/CheckoutPage.js';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(/icon: '.*?'/g, (match, offset, str) => {
  if (offset < 2000) {
    if (str.includes("Cash on Delivery", offset-100)) return "icon: 'í²µ'";
    if (str.includes("Debit / Credit Card", offset-100)) return "icon: 'í²³'";
    if (str.includes("EasyPaisa", offset-50)) return "icon: 'í³±'";
    if (str.includes("JazzCash", offset-50)) return "icon: 'í³²'";
    if (str.includes("Bank Transfer", offset-50)) return "icon: 'í¿¦'";
  }
  return match;
});

fs.writeFileSync(file, content);
console.log('Fixed icons');
