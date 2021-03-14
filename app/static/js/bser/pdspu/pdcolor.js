$(function() {
	/* ============= 颜色 增删 ============= */
	$("body").on('click', '.colorClick', function(e) {
		const target = $(e.target);
		const colorId = target.data('colorid');
		const pdspuId = target.data('pdspuid');
		const rgb = target.data('rgb');
		const code = target.data('code');
		const option = target.data('option');

		if(!code) code = ' ';
		let colorCode = code;
		if(colorCode.length > 8) colorCode = colorCode.slice(0,6) + '...';
		$.ajax({
			type: "GET",
			url: '/bsPdspuColorUpdAjax?pdspuId='+pdspuId+'&colorId='+colorId+'&option='+option,
			success: function(results) {
				if(results.status == 200) {
					if(option == 1) {
						let elem = "";
						elem += '<div class="col-4 col-md-6 col-xl-1 mt-3" id="Colored-'+colorId+'">'
							elem += '<div class="colorClick" style="background-color:#'+rgb+'; height: 30px" '
							elem += 'data-pdspuid='+pdspuId+' data-colorid='+colorId+' data-rgb='+rgb+' data-code='+code
							elem +=' data-option=-1, title='+code+'>'
							elem += '</div>'
							elem += '<div class="code text-success" style="Font-size: 8px" title='+code+'>'
								elem += colorCode
							elem += '</div>'
						elem += '</div>'
						$("#ColoredsBox").prepend(elem)
						$("#ColorPool-"+colorId).remove()
					} else {
						let elem = "";
						elem += '<div class="col-4 col-md-6 col-xl-1 mt-3" id="ColorPool-'+colorId+'">'
							elem += '<div class="colorClick" style="background-color:#'+rgb+'; height: 30px" '
							elem += 'data-pdspuid='+pdspuId+' data-colorid='+colorId+' data-rgb='+rgb+' data-code='+code
							elem +=' data-option=1, title='+code+'>'
							elem += '</div>'
							elem += '<div class="code" style="Font-size: 8px" title='+code+'>'
								elem += colorCode
							elem += '</div>'
						elem += '</div>'
						$("#ColorPoolsBox").prepend(elem)
						$("#Colored-"+colorId).remove()
					}
				} else {
					alert(results.message);
				}
			}
		});
	})
	/* ============= 颜色 增删 ============= */
})