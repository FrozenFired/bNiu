$(function() {
	/* ============= 材质 增删 ============= */
	$("body").on('click', '.mtrialClick', function(e) {
		const target = $(e.target);
		const mtrialId = target.data('mtrialid');
		const pdspuId = target.data('pdspuid');
		const option = target.data('option');
		
		$.ajax({
			type: "GET",
			url: '/bsPdspuMtrialUpdAjax?pdspuId='+pdspuId+'&mtrialId='+mtrialId+'&option='+option,
			success: function(results) {
				if(results.status == 200) {
					location.reload();
				} else {
					alert(results.message);
				}
			}
		});
	})
	/* ============= 材质 增删 ============= */
})