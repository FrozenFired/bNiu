$(() => {
	$("#objForm").submit(function(e) {
		const code = $("#codeIpt").val().replace(/^\s*/g,"").toUpperCase();
		const price = $("#priceIpt").val();
		const PdNome = $("#PdNomeReq").val().replace(/^\s*/g,"").toUpperCase();

		if(code.length < 3) {
			$("#codeDanger").show();
			e.preventDefault();
		} else if(PdNome.length < 1) {
			$("#PdNomeDanger").show();
			e.preventDefault();
		} else if(!jsFunc_isFloat(price)) {
			$("#priceDanger").show();
			e.preventDefault();
		}
	})

	$("#codeIpt").blur(function(e) {
		const code = $(this).val().replace(/^\s*/g,"").toUpperCase();
		if(code.length < 3) {
			$("#codeDanger").show();
		} else {
			$("#codeDanger").hide();
		}
	})

	$("#priceIpt").blur(function(e) {
		const price = $(this).val();
		if(!jsFunc_isFloat(price)) {
			$("#priceDanger").show();
		} else {
			$("#priceDanger").hide();
		}
	})

	$("body").on("focus", "#PdNomeReq", function(e) {
		const str = $(this).val().replace(/^\s*/g,"").toUpperCase();
		if(str.length < 1) {
			$("#PdNomeDanger").show();
		} else {
			$("#PdNomeDanger").hide();
			getPdNomes_Func(str);
		}
	})
	$("body").on("input", "#PdNomeReq", function(e) {
		const str = $(this).val().replace(/^\s*/g,"").toUpperCase();
		if(str.length < 1) {
			$("#PdNomeDanger").show();
		} else {
			$("#PdNomeDanger").hide();
			getPdNomes_Func(str);
		}
	})
	const getPdNomes_Func = (str) => {
		$.ajax({
			type: "GET",
			url: '/bsPdNomesAjax?code='+str,
			success: function(results) {
				if(results.status == 200) {
					const data = results.data;
					console.log(data)
					$(".PdNomeDatalist").remove();
					$("#PdNomeIpt").val("");

					if(data.PdNome) {
						const PdNome = data.PdNome;
						$("#PdNomeIpt").val(PdNome._id);
					}
					const PdNomes = data.PdNomes;
					let elem = "";
					for(let i=0; i<PdNomes.length; i++) {
						const PdNome = PdNomes[i];
						elem += '<option class="PdNomeDatalist" value='+PdNome.code+ ' >';
					}
					$("#PdNomeDatalist").append(elem);
				} else {
					alert(results.message);
				}
			}
		});
	}
})