$(function() {
	/* ====== 初始加载 =====*/
	let urlQuery = '';
	let objectParam = '';
	let elemId = '';
	let role = '';

	let categUrl = "/bsPdCategsAjax";
	objectsInit = () => {
		const objectFilter = $("#objectFilterAjax").val();
		if(objectFilter) {
			objectParam = objectFilter.split('@')[0];
			elemId = objectFilter.split('@')[1];
			role = objectFilter.split('@')[2];
		}
		urlQuery = objectParam;
		getObjects(urlQuery, elemId, 1, role);

		getFirCateg(categUrl);
	}
	objectsInit();

	/* ====== 选择分类 显示系列 ====== */
	$(".PdcategSel").change(function(e) {
		$(".MtFirmClick").removeClass("btn-success");
		$(".MtFirmClick").addClass("btn-default");
		$("#MtFirmAll").removeClass("btn-default");
		$("#MtFirmAll").addClass("btn-success");
		$("#codeSearch").val('');

		const target = $(e.target);
		let level = target.data("level");;

		const val = $(this).val();
		let PdCateg = new Array();
		if(val == "All") {
			if(level == 1) {
				$("#SecCateg").hide()
				$("#ThdCateg").hide()
				FirCategs.forEach((Fir) => {
					const sons = Fir.PdCategSons;
					sons.forEach((Sec) => {
						SecCategs.push(Sec)
					})
				});
			} else if(level == 2) {
				$("#ThdCateg").hide()
			}
			urlQuery = objectParam;
			getObjects(urlQuery, elemId, 1, role);
		} else if(val == "Null") {
			// PdCategId = Null
			$("#SecCateg").hide()
			$("#ThdCateg").hide()
			PdCateg = "?PdCateg=Null";
			urlQuery = objectParam + PdCateg;
			getObjects(urlQuery, elemId, 1, role);
		} else {
			if(!val || val.length != 24) {
				alert("操作错误")
			} else {
				if(level == 1) {
					$("#SecCateg").show();
					PdCategsRender(getSecCategs(val), "#SecCateg", ".optionSecCateg")
				} else if(level == 2) {
					$("#ThdCateg").show();
					PdCategsRender(getThdCategs(val), "#ThdCateg", ".optionThdCateg")
				}

			}
		}
	})

	/* ====== 点击品类名 显示系列 ====== */
	$(".MtFirmClick").click(function(e) {
		$(".MtFirmClick").removeClass("btn-success");
		$(".MtFirmClick").addClass("btn-default");

		const target = $(e.target);
		let MtFirm = target.data("pdnome");
		if(!MtFirm || MtFirm.length != 24) {
			MtFirm = "";
			$("#MtFirmAll").removeClass("btn-default");
			$("#MtFirmAll").addClass("btn-success");
		} else {
			MtFirm = "&MtFirm=" + MtFirm;
			$(this).removeClass("btn-default");
			$(this).addClass("btn-success");
		}

		page = 0;
		urlQuery = objectParam + MtFirm;
		getObjects(urlQuery, elemId, 1, role);

		$("#codeSearch").val('');
	})

	/* ====== 根据搜索关键词 显示系列 ====== */
	$("body").on("input", "#codeSearch", (e) => {
		$(".MtFirmClick").removeClass("btn-success");
		$(".MtFirmClick").addClass("btn-default");
		$("#MtFirmAll").removeClass("btn-default");
		$("#MtFirmAll").addClass("btn-success");

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
let FirCategs;
let SecCategs = new Array();
var getFirCateg = (categUrl, farId, level) => {
	$.ajax({
		type: "GET",
		url: categUrl+"?level="+1,
		success: function(results) {
			if(results.status === 200) {
				FirCategs = results.data.objects;
				if(FirCategs.length > 0) {
					FirCategs.forEach((Fir) => {
						const sons = Fir.PdCategSons;
						sons.forEach((Sec) => {
							SecCategs.push(Sec)
						})
					});
				}
				PdCategsRender(FirCategs, "#FirCateg", ".optionFirCateg");
			} else {
				alert(results.message);
			}
		}
	});
}
var getSecCategs = (FirCategId) => {
	const FirCateg = FirCategs.find((item) => {return String(item._id) == String(FirCategId);});
	return(FirCateg.PdCategSons)
}
var getThdCategs = (SecCategId) => {
	const SecCateg = SecCategs.find((item) => {return String(item._id) == String(SecCategId);});
	return(SecCateg.PdCategSons)
}

var PdCategsRender = (PdCategs, categSelectId, categSelOptionClass) => {
	let elem = "";
	for(let i=0; i<PdCategs.length; i++) {
		let PdCateg = PdCategs[i];
		elem += '<option class='+categSelOptionClass+' value='+PdCateg._id+'>'+PdCateg.code+'</option>';
	}
	$(categSelOptionClass).remove();
	$(categSelectId).append(elem);
}