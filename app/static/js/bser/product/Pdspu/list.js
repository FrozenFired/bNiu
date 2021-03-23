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

	/* ====== 点击产品分类 显示系列 ====== */
	$(".PdCategClick").click(function(e) {
		$("#codeSearch").val('');

		$(".PdNomeClick").removeClass("btn-success");
		$(".PdNomeClick").addClass("btn-default");
		$("#PdNomeAll").removeClass("btn-default");
		$("#PdNomeAll").addClass("btn-success");

		$(".PdCategClick").removeClass("btn-success");
		$(".PdCategClick").addClass("btn-default");

		const target = $(e.target);
		let PdCateg = target.data("pdcateg");
		const level = target.data("level");

		let PdCategParam = "";

		if(!PdCateg || PdCateg.length != 24) {
			PdCategParam = "";
			$("#PdCategAll").removeClass("btn-default");
			$("#PdCategAll").addClass("btn-success");
		} else {
			if(level == 1) {
				PdCategParam = "&PdCategFir="+PdCateg;
			} else if(level == 2) {
				PdCategParam = "&PdCategSec="+PdCateg;
			} else if(level == 3) {
				PdCategParam = "&PdCategThd="+PdCateg;
			}
			$(this).removeClass("btn-default");
			$(this).addClass("btn-success");
		}

		page = 0;
		urlQuery = objectParam + PdCategParam;
		getObjects(urlQuery, elemId, 1, role);

		$("#codeSearch").val('');
	})

	/* ====== 点击品类名 显示系列 ====== */
	$(".PdNomeClick").click(function(e) {
		$("#codeSearch").val('');

		$(".PdCategClick").removeClass("btn-success");
		$(".PdCategClick").addClass("btn-default");
		$("#PdCategAll").removeClass("btn-default");
		$("#PdCategAll").addClass("btn-success");

		$(".PdNomeClick").removeClass("btn-success");
		$(".PdNomeClick").addClass("btn-default");


		const target = $(e.target);
		let PdNome = target.data("pdnome");
		if(!PdNome || PdNome.length != 24) {
			PdNome = "";
			$("#PdNomeAll").removeClass("btn-default");
			$("#PdNomeAll").addClass("btn-success");
		} else {
			PdNome = "&PdNome=" + PdNome;
			$(this).removeClass("btn-default");
			$(this).addClass("btn-success");
		}

		page = 0;
		urlQuery = objectParam + PdNome;
		getObjects(urlQuery, elemId, 1, role);
	})

	/* ====== 根据搜索关键词 显示系列 ====== */
	$("body").on("input", "#codeSearch", (e) => {
		$(".PdNomeClick").removeClass("btn-success");
		$(".PdNomeClick").addClass("btn-default");
		$("#PdNomeAll").removeClass("btn-default");
		$("#PdNomeAll").addClass("btn-success");

		$(".PdCategClick").removeClass("btn-success");
		$(".PdCategClick").addClass("btn-default");
		$("#PdCategAll").removeClass("btn-default");
		$("#PdCategAll").addClass("btn-success");

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