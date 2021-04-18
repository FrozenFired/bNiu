const Conf = {
	// categStreamNums: [-1, 1, 1000],
	// categStream: {
	// 	streamdw: {num: -1, val: '下游公司'},
	// 	streamup: {num: 1, val: '上游公司'},
	// 	logistic: {num: 1000, val: '物流公司'}
	// },

	// categFirmNums: [50, 100, 500, 1000],
	// categFirm: {
	// 	// factory: {num: 1, val: '工厂'},
	// 	// proxy: {num: 10, val: '代理公司'},
	// 	// dealer: {num: 20, val: '经销公司'},
	// 	supplier: {num: 50, val: '供应公司'},
	// 	trading: {num: 100, val: '贸易公司'},
	// 	sale: {num: 500, val: '销售公司'},
	// 	logistic: {num: 1000, val: '物流公司'}
	// },

	// roleNums: [1, 3, 5, 10, 20, 25, 30, 50, 70, 90, 95, 99],
	// roleAdmins: [1, 3, 5, 10],
	roleNums: [1, 99],
	roleAdmins: [1],
	roleUser: {
		owner:    {num: 1, index: '/ower', code: 'bs', val: '拥有者 OWNER', },
		// manager:  {num: 3, index: '/mger', code: 'mg', val: '管理者 Manager', },
		// staff:    {num: 5, index: '/sfer', code: 'sf', val: '员工 Staff', },
		// finance:  {num:10, index: '/fner', code: 'fn', val: '财务 Finance', },
		// brander:  {num:20, index: '/bner', code: 'bn', val: '品牌 Brander', },
		// promotion:{num:25, index: '/pmer', code: 'pm', val: '推广 Promotion', },
		// order:    {num:30, index: '/oder', code: 'od', val: '订单 Order', },
		// quotation:{num:50, index: '/qter', code: 'qt', val: '报价 Quotation', },
		// logistic: {num:70, index: '/lger', code: 'lg', val: '物流 Logistic', },
		// boss:     {num:90, index: '/bser', code: 'bs', val: '老板 BOSS', },
		// seller:   {num:95, index: '/sler', code: 'sl', val: '销售 SELLER', },
		customer: {num:99, index: '/cter', code: 'ct', val: '客户 Customer', },
	},
	photo: {
		Pdspu: {dir: '/PDSPU/', def: '/UPLOAD/DEF/PDSPU.JPG'},
		Mtrial: {dir: '/MTRIAL/', def: '/UPLOAD/DEF/MTRIAL.JPG'},
		Ptern: {dir: '/PTERN/', def: '/UPLOAD/DEF/PTERN.JPG'},
		Color: {dir: '/COLOR/', def: '/UPLOAD/DEF/COLOR.JPG'}
	},

	shelf: {
		off: {num: -1, val: '下架'},
		put:{num: 1, val: '上架'}
	},
	isBottom: {
		n: {num: -1, val: '非底层'},
		y: {num: 1, val: '底层'}
	},

	SizeNums: [6, 7, 8, 9, 10, 11, 12, 13, 14],

	OrderStep: {
		init: {num: 1, val: "创建中"},
		check: {num: 5, val: "审核中"},
		ship: {num: 15, val: "发货中"},
		finish: {num: 20, val: "完成"},
	}
}

module.exports = Conf