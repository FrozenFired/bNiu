$(function() {
	/* ====== 初始加载 =====*/
	let urlQuery = '';
	let objectParam = '';
	let elemId = '';
	let role = '';

	objectsInit = () => {
		const objectFilter = $("#objectFilterAjax").val();
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

	/* ====== 检查用料 ====== */
	$("body").on('click', '.checkboxOrder', function(e) {
		if($(this).attr("checked")) {
			$(this).removeAttr("checked");
		} else {
			$(this).attr("checked","true");
		}
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


	// 用料分析
	$("body").on("click", ".OdCostMtBtn", (e) => {
		const OrderIds = new Array();
		$(".checkboxOrder").each(function(index,elem) {
			if($(this).attr("checked")) {
				OrderIds.push($(this).val())
			}
		})
		if(OrderIds.length < 1) {
			$(".costMts").remove();
			alert("请选择订单")
		} else {
			const data = "OrderIds="+OrderIds;
			$.ajax({
				type: "POST",
				url: "/bsOrderCostMtAjax",
				data: data,
				success: function(results) {
					if(results.status === 200) {
						const costMts = results.data.costMts;
						if(costMts && costMts.length > 0) {
							costMtsRender(costMts)
						} else {
							alert("信息错误")
						}
					} else {
						alert(results.message)
					}
				}
			});
		}
	})
})

const costMtsRender = (costMts) => {
	let elem = ''
	elem += '<table class="table table-striped costMts">';
		elem += '<thead><tr>'
			elem += '<th>用料</th>'
			elem += '<th>用量</th>'
			elem += '<th>供货商</th>'
		elem += '</tr></thead>'
		elem += '<tbody>'
			for(let i=0; i<costMts.length; i++) {
				let costMt = costMts[i];
				let Mtrial = costMt.Mtrial;
				elem += '<tr>'
					elem += '<td>'+Mtrial.code+'</td>'
					elem += '<td>'+costMt.dosage+'</td>'
					elem += '<td>'+Mtrial.MtFirm.code+'</td>'
				elem += '</tr>'
			}
		elem += '</tbody>'
	elem += '</table>'
	$(".costMts").remove();
	$("#costMts").append(elem);
}