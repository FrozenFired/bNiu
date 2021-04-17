$(function() {
	let page = 0;
	let count;
	let isMore;
	const getObjects = (urlQuery, elemId, isReload, role) => {
		// console.log(urlQuery)
		// console.log(elemId)
		// console.log(isReload)
		// console.log(role)

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
			elem += '<div class="row mt-3 border rounded p-3 objectsElem">'
				elem += '<div class="col-md-6 col-lg-4">'
					elem += '<a href="/bsOrder/'+object._id+'">编号: '+object.code+'</a>'
				elem += '</div>'
				elem += '<div class="col-md-6 col-lg-4 ">'
					if(object.note) {
						elem += '<div>备注: ';
							elem += object.note;
						elem += '</div>'
					}
					// elem += '<div class="text-right mt-3 jsDel-objElem" style="display:none">'
					// 	elem += '<a class="text-danger" href="/bsOrderDel/'+object._id+'">[删除]</a>'
					// elem += '</div>'
				elem += '</div>'
			elem += '</div>'
		}
		if(isReload == 1) $(".objectsElem").remove();
		if(!elemId) elemId = "#objectsElem";
		$(elemId).append(elem);
	}
	
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
	$("body").on("input", "#codeSearch", (e) => {
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