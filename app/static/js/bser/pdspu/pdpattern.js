$(function() {
	/* ============= 印花 增删 ============= */
	$("body").on('click', '.patternClick', function(e) {
		const target = $(e.target);
		const patternId = target.data('patternid');
		const pdspuId = target.data('pdspuid');
		const option = target.data('option');
		
		$.ajax({
			type: "GET",
			url: '/bsPdspuPatternUpdAjax?pdspuId='+pdspuId+'&patternId='+patternId+'&option='+option,
			success: function(results) {
				if(results.status == 200) {
					location.reload();
				} else {
					alert(results.message);
				}
			}
		});
	})
	/* ============= 印花 增删 ============= */
})