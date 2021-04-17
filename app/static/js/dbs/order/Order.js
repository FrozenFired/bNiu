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
