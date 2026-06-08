// invoice — mock data for the internal-tools app family
window.INVOICE_DATA = {
  invoices: [
    { id: 'INV-0042', client: 'Nordlys Media AS', amount: 18400, currency: 'NOK', status: 'paid', issued: '12 May', due: '26 May',
      items: [['Design system audit', 1, 14000], ['Component build', 1, 4400]] },
    { id: 'INV-0041', client: 'Bergen Legal Aid', amount: 9600, currency: 'NOK', status: 'sent', issued: '02 Jun', due: '16 Jun',
      items: [['capcms monthly retainer', 1, 9600]] },
    { id: 'INV-0040', client: 'Fjord Software', amount: 26250, currency: 'NOK', status: 'overdue', issued: '18 Apr', due: '02 May',
      items: [['kbpkg integration', 35, 750]] },
    { id: 'INV-0039', client: 'Oslo Kommune', amount: 12000, currency: 'NOK', status: 'draft', issued: '—', due: '—',
      items: [['mdcms migration', 1, 12000]] },
    { id: 'INV-0038', client: 'Nordlys Media AS', amount: 7200, currency: 'NOK', status: 'paid', issued: '28 Apr', due: '12 May',
      items: [['Maintenance', 12, 600]] },
  ],
  from: { name: 'Karl Benestad', org: 'kBenestad', email: 'karl@kbenestad.no', orgnr: 'NO 998 877 665' },
};
