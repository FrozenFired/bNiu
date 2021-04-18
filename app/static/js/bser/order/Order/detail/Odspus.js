$(function() {
	let OrderId = $("#OrderId").val();

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
						page = results.data.page
						isMore = results.data.isMore
						count = results.data.count
						$("#objectCount").text(count)
						if(objects) {
							objectsRender(objects, elemId, isReload, role)
						}
					}
				} else {
					alert(results.message);
				}
			}
		});
	}

	const objectsRender = (objects, elemId, isReload, role) => {
		let elem = ''
		for(let i=0; i<objects.length; i++) {
			let object = objects[i];
			elem += '<div class="row mt-3 border rounded p-3 OdspusElem">'
				if(object.Pdspu) {
					let Pdspu = object.Pdspu;
					elem += '<div class="col-6">'
						elem += '<a href="/bsPdspu/'+Pdspu._id+'">编号: '+Pdspu.code+'</a>'
					elem += '</div>'
					elem += '<div class="col-6 ">'
						elem += '<div class="text-right jsDel-objElem" style="display:none">'
							elem += '<a class="text-danger" href="/bsOdspuDel/'+object._id+'">[清空]</a>'
						elem += '</div>'
					elem += '</div>'
					elem += OdskusTableRender(object);
				} else {
					elem += '<div class="col-12">产品错误</div>'
				}
			elem += '</div>'
		}
		if(isReload == 1) $(".OdspusElem").remove();
		if(!elemId) elemId = "#OdspusElem";
		$(elemId).append(elem);
	}
	const OdskusTableRender = (Odspu) => {
		// console.log("OdskusTableRender")
		let Pdspu = Odspu.Pdspu;

		let Pterns = new Array();
		if(Odspu.Pterns && Odspu.Pterns.length > 0) {
			Pterns = Odspu.Pterns;
		}  else {
			Pterns.push({_id: null, code: "Pattern Unico"});
		}

		let Colors = new Array();
		if(Odspu.Colors && Odspu.Colors.length > 0) {
			Colors = Odspu.Colors;
		} else {
			Colors.push({_id: null, code: "Color Unico"});
		}

		let sizes = new Array();
		if(Odspu.sizes && Odspu.sizes.length > 0) {
			sizes = Odspu.sizes;
		} else {
			sizes.push("size Unico");
		}

		let widthTr = 100/(sizes.length+1);

		let elem = "";
		for(let PternsCyc=0; PternsCyc<Pterns.length; PternsCyc++) {
			const Ptern = Pterns[PternsCyc];
			let Ptern_Odskus = Odspu.Odskus.filter((Odsku_item) => {if((Odsku_item.Ptern == Ptern._id) || (String(Odsku_item.Ptern) == String(Ptern._id))) return true; return false; });
			elem += '<div class="PternTable col-12 py-3 pl-5" id="PternTable-'+Ptern._id+'">'
				elem += '<div class="row mt-3">'
					elem += '<div class="col-md-2 text-center">';
						if(Ptern._id) {
							elem += '<img class="js-click-imgEnlarge" src="'+Ptern.photo+'" alt="Ptern Photo Lost" '
							elem += 'width="100%" height="80px" style="object-fit: scale-down;">'
						}
						elem += Ptern.code
					elem += '</div>'
					elem += '<div class="col-md-10">';
						elem += '<table class="table table-hover table-bordered text-center">'
							elem += '<thead>'
								elem += '<tr>'
									elem += '<th width='+widthTr+'%></th>'
									for(let sizesCycle=0; sizesCycle<sizes.length; sizesCycle++) {
										let size = sizes[sizesCycle];
										elem += '<th width='+widthTr+'%>'+ size +'</th>'
									}
								elem += '</tr>'
							elem += '</thead>'
							elem += '</tbody>'
								for(let ColorsCyc=0; ColorsCyc<Colors.length; ColorsCyc++) {
									let Color = Colors[ColorsCyc]
									let Color_Odskus = Ptern_Odskus.filter((Odsku_item) => {if((Odsku_item.Color == Color._id) || (String(Odsku_item.Color) == String(Color._id))) return true; return false; });
									elem += '<tr>'
										elem += '<td>'+Color.code+'</td>'
										for(let sizesCyc=0; sizesCyc<sizes.length; sizesCyc++) {
											let size = sizes[sizesCyc]
											size_Odskus = Color_Odskus.filter((Odsku_item) => {return Odsku_item.size == size});
											elem += '<td>'
												elem += OdskuFormRender(Odspu, size_Odskus, Ptern, Color, size);
											elem += '</td>'
										}
									elem += '</tr>'
								}
							elem += '</tbody>'
						elem += '</table>'
					elem += '</div>'
				elem += '</div>'

			elem += '</div>'
		}
		return elem;
	}
	let OdspuNewLen = 0;
	const OdskuFormRender = (Odspu, Odsku, Ptern, Color, size, Pdsku) =>{
		OdspuNewLen++;
		let elem = "";
		if(Odsku._id) {
			elem += '<form class="bsOdskuUpdAjaxForm" id="bsOdskuUpdAjaxForm-'+OdspuUpdLen+'">'
				elem += '<input type="hidden" name="obj[_id]" value='+Odsku._id+'>';
				elem += '<input type="number" class="ajaxQuanIpt iptsty" data-edit="#bsOdskuUpdAjaxForm-" data-len='+OdspuNewLen+' name="obj[quan]" value='+Odsku.quan+'>';
				elem += '<span>1'+Odsku+'</span>';
			elem += '</form>';
		} else {
			elem += '<form class="bsOdskuNewAjaxForm" id="bsOdskuNewAjaxForm-'+OdspuNewLen+'">'
				elem += '<input type="hidden" name="obj[Odspu]" value='+Odspu._id+'>';
				elem += '<input type="hidden" name="obj[Pdspu]" value='+Odspu.Pdspu._id+'>';
				elem += '<input type="hidden" name="obj[Ptern]" value='+Ptern._id+'>';
				elem += '<input type="hidden" name="obj[Color]" value='+Color._id+'>';
				elem += '<input type="hidden" name="obj[size]" value='+size+'>';
				elem += '<input type="number" class="ajaxQuanIpt iptsty" data-edit="#bsOdskuNewAjaxForm-" data-len='+OdspuNewLen+' name="obj[quan]" value=0>';
			elem += '</form>';
		}
		return elem;
	}
	$("body").on("blur", ".ajaxQuanIpt", function(e) {
		const target = $(e.target);
		const edit = target.data("edit");
		const len = target.data("len");

		const form = $(edit+len);
		const data = form.serialize();
		console.log(data)
		$.ajax({
			type: "POST",
			url: "/bsOdskuNewAjax",
			data: data,
			success: function(results) {
				if(results.status == 200) {
					
				} else {
					alert(results.message);
				}
			}
		});
	})
	
	/* ====== 初始加载 =====*/
	let urlQuery = '';
	let objectParam = '';
	let elemId = '';
	let role = '';
	objectsInit = () => {
		const objectFilter = $("#OdspusFilterAjax").val();
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
	$("body").on("input", "#codeSearch", function(e) {
		let code = $("#codeSearch").val().replace(/(\s*$)/g, "").replace( /^\s*/, '').toUpperCase();

		if(code && code.length > 0) {
			code = "&code=" + code;
		} else {
			code = "";
		}

		page = 0;
		urlQuery = objectParam + code;
		getObjects(urlQuery, elemId, 1, role);
	})

	$(window).scroll(function(){
		const scrollTop = $(this).scrollTop();
		const scrollHeight = $(document).height();
		const windowHeight = $(this).height();
		if(scrollTop + windowHeight + 58 > scrollHeight){
			if(isMore == 1) {
				getObjects(urlQuery+'&page='+(parseInt(page)+1), elemId, 0, role);
			}
		}
	});
})