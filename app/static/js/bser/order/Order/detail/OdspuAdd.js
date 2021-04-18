$(function() {
	let page = 0;
	let count;
	let isMore;
	const getObjects = (urlQuery, elemId, isReload, role) => {
		$.ajax({
			type: "GET",
			url: urlQuery,
			success: function(results) {
				if(results.status === 200) {
					if(page+1 != results.data.page) {
						// 如果数据错误 则不输出
					} else {
						let objects = results.data.objects;
						let object = results.data.object;
						page = results.data.page
						isMore = results.data.isMore
						count = results.data.count
						$("#objectCount").text(count)
						let temps = new Array();
						if(object) {
							for(let i=0; i<objects.length; i++) {
								if(objects[i]._id != object._id) temps.push(objects[i]);
							}
							temps.unshift(object);
						} else {
							temps = objects;
						}
						if(temps.length > 0) {
							objectsRender(temps, elemId, isReload, role)
						}
					}
				} else {
					alert(results.message);
				}
			}
		});
	}

	const objectsRender = (objects, elemId, isReload, role) => {
		let elem = '<div class="row OdspuAddElem">'
			for(let i=0; i<objects.length; i++) {
				let object = objects[i];
				elem += '<div class="col-4 col-md-3 col-lg-2 mt-2 text-center border-bottom border-left objectCard">'
					elem += '<img class="js-click-imgEnlarge" src="'+object.photo+'" '
						elem += 'width="100%" height="120px" '
						elem += 'style="object-fit: scale-down;"'
					elem += '/>'
					elem += '<h5>'+object.code+'</h5>'
					elem += '<button class="btn btn-info newPdspuBtn" data-id='+object._id+' type="button">[选择]</button>'
				elem += '</div>'
			}
		elem += '</div>'
		if(isReload == 1) $(".OdspuAddElem").remove();
		if(!elemId) elemId = "#OdspuAddElem";
		$(elemId).append(elem);
	}

	/* ====== 初始加载 =====*/
	let urlQuery = '';
	let objectParam = '';
	let elemId = '';
	let role = '';
	let OrderId = '';
	objectsInit = () => {
		OrderId = $("#OrderId").val();
		const objectFilter = $("#OdspuAddFilterAjax").val();
		if(objectFilter) {
			objectParam = objectFilter.split('@')[0];
			elemId = objectFilter.split('@')[1];
			role = objectFilter.split('@')[2];
		}
		urlQuery = objectParam;
		getObjects(urlQuery, elemId, 1, role);
	}
	objectsInit();

	/* ====== 根据搜索关键词 显示系列 ====== */
	$("body").on("focus", "#OdspuAddCodeSearch", (e) => {
		newPdspuCodeFunc();
	})
	$("body").on("input", "#OdspuAddCodeSearch", (e) => {
		newPdspuCodeFunc();
	})
	const newPdspuCodeFunc = ()=> {
		let code = $("#OdspuAddCodeSearch").val().replace(/(\s*$)/g, "").replace( /^\s*/, '').toUpperCase();

		if(code && code.length > 1) {
			code = "&code=" + code;
			page = 0;
			urlQuery = objectParam + code;
			getObjects(urlQuery, elemId, 1, role);
		} else {
			$(".OdspuAddElem").remove();
		}
	}

	$("body").on("click", ".newPdspuBtn", (e) => {
		$(".OdspuAddElem").remove();
		const target = $(e.target);
		const id = target.data("id");
		$.ajax({
			type: "GET",
			url: "/bsPdspuAjax?id="+id,
			success: function(results) {
				if(results.status === 200) {
					let object = results.data.object;
					let Sizes = results.data.Sizes;
					if(!Sizes) Sizes = new Array();
					objectRender(object, Sizes, elemId)
				} else {
					alert(results.message);
				}
			}
		});
	})

	const objectRender = (object, Sizes, elemId) => {
		let elem = '<form id="bsOdspuNewAjaxForm" class="OdspuAddElem" method="post" action="/bsOdspuNew" enctype="multipart/form-data">'
		elem += '<input type="hidden" name="obj[Order]" value='+OrderId+'>'
		elem += '<input type="hidden" name="obj[Pdspu]" value='+object._id+'>'
		elem += '<div class="row py-2 border">'
			elem += '<div class="col-4 col-md-3 col-lg-2 mt-2 text-center">'
				elem += '<img class="js-click-imgEnlarge" src="'+object.photo+'" '
					elem += 'width="100%" height="120px" '
					elem += 'style="object-fit: scale-down;"'
				elem += '/>'
				elem += '<h5>'+object.code+'</h5>'
				if(object.PdNome) {
					elem += '<h5>'+object.PdNome.code+'</h5>'
				}
			elem += '</div>'
			elem += '<div class="col-2 d-sm-block d-md-none"></div>'
			elem += '<div class="col-6 col-md-3 col-lg-2 mt-2">'
				if(object.Pterns && object.Pterns.length > 0) {
					const Pterns = object.Pterns;
					elem += '<h4>印花</h4>';
					for(i=0; i<Pterns.length; i++) {
						const Ptern = Pterns[i];
						elem += '<div class="form-check">';
							elem += '<input class="form-check-input  checkIpt checkIpt-Pterns" type="checkbox" name="obj[Pterns]" value='
							elem += Ptern._id+' id="PternCheck-'+Ptern._id+'" checked="checked">';
							elem += '<label class="form-check-label" for="PternCheck-'+Ptern._id+'">'
								elem += Ptern.code
							elem += '</label>'
						elem += '</div>'
					}
				}
			elem += '</div>'
			elem += '<div class="col-6 col-md-3 col-lg-2 mt-2">'
				if(object.Colors && object.Colors.length > 0) {
					const Colors = object.Colors;
					elem += '<h4>颜色</h4>';
					for(i=0; i<Colors.length; i++) {
						const Color = Colors[i];
						elem += '<div class="form-check">';
							elem += '<input class="form-check-input  checkIpt checkIpt-Colors" type="checkbox" name="obj[Colors]" value='
							elem += Color._id+' id="ColorCheck-'+Color._id+'" checked="checked">';
							elem += '<label class="form-check-label" for="ColorCheck-'+Color._id+'">'
								elem += Color.code
							elem += '</label>'
						elem += '</div>'
					}
				}
			elem += '</div>'
			elem += '<div class="col-6 col-md-3 col-lg-2 mt-2">'
				if(object.sizes && object.sizes.length > 0) {
					const sizes = object.sizes;
					elem += '<h4>尺寸</h4>';
					for(i=0; i<sizes.length; i++) {
						const size = sizes[i];
						let val = size;
						for(j=0; j<Sizes.length; j++) {
							const Size = Sizes[j];
							if(Size.size == size) {
								val = Size.symbol;
								break;
							}
						}
						elem += '<div class="form-check">';
							elem += '<input class="form-check-input  checkIpt checkIpt-sizes" type="checkbox" name="obj[sizes]" value='
							elem += val+' id="sizeCheck-'+size+'" checked="checked">';
							elem += '<label class="form-check-label" for="sizeCheck-'+size+'">'
								elem += val
							elem += '</label>'
						elem += '</div>'
					}
				}
			elem += '</div>'
			elem += '<div class="col-12 text-right">'
				elem += '<button id="bsOdspuNewAjaxBtn" class="btn btn-success" type="button">添加</button>'
			elem += '</div>'
		elem += '</div>'
		elem += '</form>'
		$(".OdspuAddElem").remove();
		if(!elemId) elemId = "#OdspuAddElem";
		$(elemId).append(elem);
	}


	/* ======================= 点击目标产品，显示产品的信息，并加以选择 ======================= */
	/* -------------------- 颜色的选择 -------------------- */
	$("body").on('click', '.checkIpt', function(e) {
		if($(this).attr("checked")) {
			$(this).removeAttr("checked");
		} else {
			$(this).attr("checked","true");
		}
	})
	// // 点击全选按钮，选择所有颜色
	// $("#prodPage").on('click', '.colorAll', function(e) {
	// 	$(".colorSel").each(function(index,elem) {
	// 		$(this).attr("checked","true");
	// 		$(this).prop("checked", true);
	// 	})
	// })
	// // 点击反选按钮，反向选择颜色
	// $("#prodPage").on('click', '.colorReverse', function(e) {
	// 	$(".colorSel").each(function(index,elem) {
	// 		if($(this).attr("checked")) {
	// 			$(this).removeAttr("checked");
	// 			$(this).prop("checked", false);
	// 		} else {
	// 			$(this).attr("checked","true");
	// 			$(this).prop("checked", true);
	// 		}
	// 	})
	// })
	// // 点击取消按钮，取消所有颜色
	// $("#prodPage").on('click', '.colorDel', function(e) {
	// 	$(".colorSel").each(function(index,elem) {
	// 		$(this).removeAttr("checked");
	// 		$(this).prop("checked", false);
	// 	})
	// })
	/* -------------------- 颜色的选择 -------------------- */

	$("body").on("click", "#bsOdspuNewAjaxBtn", function(e) {
		let checkPtern = checkColor = checksize = 0;
		let checkedPtern = checkedColor = checkedsize = 0;
		$(".checkIpt-Pterns").each(function(index,elem) {
			checkPtern++;
			if($(this).attr("checked")) {
				checkedPtern++;
			}
		})
		$(".checkIpt-Colors").each(function(index,elem) {
			checkColor++;
			if($(this).attr("checked")) {
				checkedColor++;
			}
		})
		$(".checkIpt-sizes").each(function(index,elem) {
			checksize++;
			if($(this).attr("checked")) {
				checkedsize++;
			}
		})

		if(checkPtern != 0 && checkedPtern == 0) {
			alert("请选择印花")
		} else if(checkColor != 0 && checkedColor == 0) {
			alert("请选择颜色")
		} else if(checksize != 0 && checkedsize == 0) {
			alert("请选择尺寸")
		} else {
			$("#bsOdspuNewAjaxForm").submit();
		}

	})
})