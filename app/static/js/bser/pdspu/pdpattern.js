$(function() {
	/* ============= 印花 增删 ============= */
	$("body").on('click', '.pternClick', function(e) {
		const target = $(e.target);
		const pternId = target.data('pternid');
		const pdspuId = target.data('pdspuid');
		const option = target.data('option');
		
		$.ajax({
			type: "GET",
			url: '/bsPdspuPternUpdAjax?pdspuId='+pdspuId+'&pternId='+pternId+'&option='+option,
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