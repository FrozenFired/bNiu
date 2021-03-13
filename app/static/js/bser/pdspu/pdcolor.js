$(function() {
	/* ============= 颜色 增删 ============= */
	$(".body").on('click', '.colorIpt', function(e) {
		alert(1)
		let target = $(e.target);
		let ColorId = target.data('id');
		let Color = target.data('Color');
		let nome = target.data('nome');
		console.log(ColorId);
		console.log(Color);
		console.log(nome);
		return;
		if(!nome) nome = ' ';
		let Colornome = nome;
		if(Colornome.length > 8)
			Colornome = Colornome.slice(0,6) + '...';
		let sym = target.data('sym');
		let id = $("#pdfirId").val();
		$.ajax({
			type: "GET",
			url: '/bsPdspuColorUpdAjax?id='+id+'&ColorId='+ColorId+'&sym='+sym,
			success: function(results) {
				if(results.success == 1) {
					sym = results.sym;
					if(sym == 1) {
						let elem = "";
						elem += '<div class="col-4 col-md-6 col-xl-1 mt-3" id="Colored-'+ColorId+'">'
							elem += '<div class="colorIpt" style="background-Color:#'+Color+'; height: 30px" '
							elem += 'data-id='+ColorId+' data-Color='+Color+' data-nome='+nome
							elem +=' data-sym=0, title='+nome+'>'
							elem += '</div>'
							elem += '<div class="nome text-success" style="Font-size: 8px" title='+nome+'>'
								elem += Colornome
							elem += '</div>'
						elem += '</div>'
						$("#ColoredsBox").prepend(elem)
						$("#ColorPool-"+ColorId).remove()
					} else {
						let elem = "";
						elem += '<div class="col-4 col-md-6 col-xl-1 mt-3" id="ColorPool-'+ColorId+'">'
							elem += '<div class="colorIpt" style="background-Color:#'+Color+'; height: 30px" '
							elem += 'data-id='+ColorId+' data-Color='+Color+' data-nome='+nome
							elem +=' data-sym=1, title='+nome+'>'
							elem += '</div>'
							elem += '<div class="nome" style="Font-size: 8px" title='+nome+'>'
								elem += Colornome
							elem += '</div>'
						elem += '</div>'
						$("#ColorPoolsBox").prepend(elem)
						$("#Colored-"+ColorId).remove()
					}
				} else {
					alert(results.info);
				}
			}
		});
	})
	/* ============= 颜色 增删 ============= */
})