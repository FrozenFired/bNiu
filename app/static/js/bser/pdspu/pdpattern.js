$(function() {
	/* ============= 颜色 增删 ============= */
	$(".colorIptBox").on('click', '.colorIpt', function(e) {
		let target = $(e.target);
		let colorId = target.data('id');
		let color = target.data('color');
		let nome = target.data('nome');
		if(!nome) nome = ' ';
		let colornome = nome;
		if(colornome.length > 8)
			colornome = colornome.slice(0,6) + '...';
		let sym = target.data('sym');
		let id = $("#pdfirId").val();
		$.ajax({
			type: "GET",
			url: '/bsPdColorAjax?id='+id+'&colorId='+colorId+'&sym='+sym,
			success: function(results) {
				if(results.success == 1) {
					sym = results.sym;
					if(sym == 1) {
						let elem = "";
						elem += '<div class="col-4 col-md-6 col-xl-1 mt-3" id="colored-'+colorId+'">'
							elem += '<div class="colorIpt" style="background-color:#'+color+'; height: 30px" '
							elem += 'data-id='+colorId+' data-color='+color+' data-nome='+nome
							elem +=' data-sym=0, title='+nome+'>'
							elem += '</div>'
							elem += '<div class="nome text-success" style="Font-size: 8px" title='+nome+'>'
								elem += colornome
							elem += '</div>'
						elem += '</div>'
						$("#coloredsBox").prepend(elem)
						$("#colorPool-"+colorId).remove()
					} else {
						let elem = "";
						elem += '<div class="col-4 col-md-6 col-xl-1 mt-3" id="colorPool-'+colorId+'">'
							elem += '<div class="colorIpt" style="background-color:#'+color+'; height: 30px" '
							elem += 'data-id='+colorId+' data-color='+color+' data-nome='+nome
							elem +=' data-sym=1, title='+nome+'>'
							elem += '</div>'
							elem += '<div class="nome" style="Font-size: 8px" title='+nome+'>'
								elem += colornome
							elem += '</div>'
						elem += '</div>'
						$("#colorPoolsBox").prepend(elem)
						$("#colored-"+colorId).remove()
					}
				} else {
					alert(results.info);
				}
			}
		});
	})
	/* ============= 颜色 增删 ============= */


	/* ============= 尺寸 添加 ============= */
	$(".sAdd").click(function(e) {
		let id = $("#pdfirId").val();

		let target = $(e.target);
		let size = target.data('size');
		$.ajax({
			type: "GET",
			url: '/bsPdAjaxNewSize?id='+id+'&size='+size,
			success: function(results) {
				if(results.success == 1) {
					let newSize = results.newSize;
					if(newSize) {
						let elem = "";
						elem += '<div class="col-2 mt-3" id="colSize-'+newSize+'">'
							elem += newSize;
						elem += '</div>'
						if(size == "l") {
							$(".sizeElem").prepend(elem)
						} else {
							$(".sizeElem").append(elem)
						}
					}
				} else {
					alert(results.info);
				}
			}
		});
	})
	/* ============= 尺寸 添加 ============= */
	/* ============= 尺寸 删除 ============= */
	$(".sDel").click(function(e) {
		let id = $("#pdfirId").val();

		let target = $(e.target);
		let size = target.data('size');
		$.ajax({
			type: "GET",
			url: '/bsPdAjaxDelSize?id='+id+'&size='+size,
			success: function(results) {
				if(results.success == 1) {
					let delSize = results.delSize;
					if(delSize) {
						$("#colSize-"+delSize).remove();
					}
				} else {
					alert(results.info);
				}
			}
		});
	})
	/* ============= 尺寸 增删 ============= */

})