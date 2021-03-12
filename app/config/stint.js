const Stint = {
	extent: {
		user: {
			code: {regexp: '^[a-zA-Z0-9]*$', min: 4, max: 15},
			pwd: {min: 6, max: 12},
		},
		firm: {
			code: {regexp: '^[a-zA-Z]*$', len: 4},
			nome: {min: 2},
		},
		nation: { code: {regexp: '^[a-zA-Z]*$', min: 2, max: 3} },
		categ: { code: {regexp: '^[a-zA-Z0-9]*$', min: 2, max: 20} },
		color: {rgb: {regexp: '^[a-fA-F0-9]*$', len: 6}}
	}
}

module.exports = Stint