var rightclickPanel;
var spreadsheet = new Spreadsheet();
var selectedClassNames = ['slctedSprCell' ,'onerowrightSelectedCell','onerowleftSelectedCell' ,
						  'bottomborderSelectedCell', 'rightborderSelectedCell' ,'leftborderSelectedCell' ,
						  'singlecolumnbottomSelectedCell' ,'singlecolumntopSelectedCell' ,
						  'singlecolumnleftrightborderSelectedCell' , 'singlerowrightSelectedCell' ,
						  'singlerowleftSelectedCell' , 'singlerowtopbottomborderSelectedCell' ,
						  'topborderSelectedCell' , 'bottomrightSelectedCell' , 'bottomleftSelectedCell' ,
						  'toprightSelectedCell' , 'topleftSelectedCell' ,'insideSlctedSprCell' ];

var util = {		
	left : function(element){
		return element.getBoundingClientRect().left;					
	},
	right : function(element){
		var boundingRectangle =  element.getBoundingClientRect();
		return boundingRectangle.left + boundingRectangle.width;
	},
	top : function(element){
		return element.getBoundingClientRect().top;	
	},
	bottom : function(element){
		var boundingRectangle =  element.getBoundingClientRect();
		return boundingRectangle.top + boundingRectangle.height;
	},

	getEventTarget : function(e) {
		return e.target ? e.target : e.srcElement;
	},
	preventDefault : function(e) {
		e.preventDefault ? e.preventDefault() : e.returnValue = false;
	},
	addEvent : function(element, type, func) {
		if( element == null )
			return;
	
		if (element.addEventListener) {
			element.addEventListener(type, func, false);
		} else if (element.attachEvent) {
			element.attachEvent('on' + type, func);
		} else {
			element['on' + type] = func;
		}
	},
	getTextContent : function(element){
		if( element.textContent != null )
			return element.textContent;
		if( element.innerText != null )
			return element.innerText;
	},
	setTextContent : function(element,text){
		if( element.textContent != null ) {
			element.textContent = text;
			return;
		}
		if( element.innerText != null ){
			element.innerText = text;
			return;
		}
	}
};

function RightclickPanel(elementId, menuId) {
	clickTarget = null;
	element = document.getElementById(elementId);
	menu = document.getElementById(menuId);
	
	util.addEvent(element, 'contextmenu', function(e) {		
		e.target = util.getEventTarget(e);

		menu.style.top = e.clientY + "px";
		menu.style.left = e.clientX + "px";
		menu.style.display = "block";
		menu.style.zIndex = "1000";

		util.preventDefault(e);						
	});

	util.addEvent(document.documentElement, 'mousedown', function(e) {
		menu.style.display = 'none';						
	});				
}

function Spreadsheet(){
	this.focusedCell = null;
	this.dragBegun = false;
	this.selectedCells = new Array();
	this.firstRangeCellIndex;
	this.firstRangeRowIndex;
	this.lastRangeCellIndex ;
	this.lastRangeRowIndex ;
	this.firstSelectedCell ;		
	this.mouseLastX;
	this.mouseLastY;
	this.scrollHorizontalActive = false;
	this.scrollVerticalActive = false;
	this.copyContent = null;

	Spreadsheet.prototype.focusOut = function(){
		if( this.focusedCell != null && this.focusedCell.children.length > 0 ){
			var input = this.focusedCell.children[0];
			var content = input.value;
			this.focusedCell.removeChild(input);
			util.setTextContent(this.focusedCell,content);
			this.focusedCell = null;
		}
	};

	Spreadsheet.prototype.focus = function(cell){
		if( cell.nodeName == 'TD' ){
			this.focusOut();
			
			var input = document.createElement('input');
			input.setAttribute('type','text');
		
			var text = util.getTextContent(cell);
			util.setTextContent(cell,'');
			this.focusedCell = cell;												
			this.focusedCell.appendChild(input);
			
			input.className = 'focusedCell';			
			input.value = text;
			input.focus();						
		}
	};
	
	Spreadsheet.prototype.focusByKey = function(cell){
		this.focus(cell);
		cell.children[0].value = '';					
	};				

	Spreadsheet.prototype.redrawCell = function(cell){
		cell.className = 'sprCell';
	};
	
	Spreadsheet.prototype.selectClickedCell = function(cell){
		for ( var i = 0; i < this.selectedCells.length; i++) {
			this.redrawCell(this.selectedCells[i]);
		}
		
		this.firstRangeCellIndex = cell.cellIndex;
		this.firstRangeRowIndex = cell.parentElement.rowIndex;
		this.lastRangeCellIndex = this.firstRangeCellIndex;
		this.lastRangeRowIndex = this.firstRangeRowIndex;
		this.selectedCells.splice(0, this.selectedCells.length);
		this.selectedCells.push(cell);
		cell.className = 'slctedSprCell';			
		this.firstSelectedCell = cell;	
	};
	
	Spreadsheet.prototype.mouseDown = function(cell,button) {
		if (button == 1 || button == 0) {
			this.dragBegun = true;								
			this.selectClickedCell(cell);
		} else if (button == 2) {						
			if (this.selectedCells.length == 0
					|| cell.cellIndex < this.firstRangeCellIndex
					|| cell.cellIndex > this.lastRangeCellIndex
					|| cell.parentElement.rowIndex < this.firstRangeRowIndex
					|| cell.parentElement.rowIndex > this.lastRangeRowIndex) {

				this.selectClickedCell(cell);
			}
		}
	};
	
	Spreadsheet.prototype.mouseUp = function(cell) {
		if (spreadsheet.dragBegun == true) {
			spreadsheet.lastRangeCellIndex = cell.cellIndex;
			spreadsheet.lastRangeRowIndex = cell.parentElement.rowIndex;
			spreadsheet.drawSelectedCells();
			spreadsheet.dragBegun = false;
		}
	};				
	
	Spreadsheet.prototype.drawSelectedCells = function(){
		if (this.dragBegun == true) {
			if (this.firstRangeCellIndex > this.lastRangeCellIndex) {
				var temp = this.firstRangeCellIndex;
				this.firstRangeCellIndex = this.lastRangeCellIndex;
				this.lastRangeCellIndex = temp;
			}
			if (this.firstRangeRowIndex > this.lastRangeRowIndex) {
				var temp = this.firstRangeRowIndex;
				this.firstRangeRowIndex = this.lastRangeRowIndex;
				this.lastRangeRowIndex = temp;
			}

			var fsc = this.firstSelectedCell;

			table = document.getElementById("rightTableWithRows");
			var rows = table.rows;
			var rowsLength = rows.length;
			var cellsLength = 0;
			
			for(var i=0; i<rows.length; i++ ){
				var row = rows[i];
				if( i>= this.firstRangeRowIndex && i<=this.lastRangeRowIndex ){
					var cells = row.cells;
					for(var j=0; j<cells.length; j++){
						var cell = cells[j];
						if( j>=this.firstRangeCellIndex && j<=this.lastRangeCellIndex  ){
							cell.className = 'insideSlctedSprCell';
						}
					}
				}
			}						

			for ( var i = this.firstRangeRowIndex; i <= this.lastRangeRowIndex; i++) {
				var row = rows[i];
				var rowCells = row.cells;
				if (cellsLength == 0)
					cellsLength = rowCells.length;

				for ( var j = this.firstRangeCellIndex; j <= this.lastRangeCellIndex; j++) {
					var cell = rowCells[j];
					
					if( this.lastRangeRowIndex - this.firstRangeRowIndex >= 1 && this.lastRangeCellIndex - this.firstRangeCellIndex >= 1){
						if( i == this.firstRangeRowIndex ){					
							cell.className = 'topborderSelectedCell';										
						}else if( i == this.lastRangeRowIndex ){
							cell.className = 'bottomborderSelectedCell';	
						}		
					
						if( j == this.firstRangeCellIndex ){
							cell.className = 'leftborderSelectedCell';	
						}else if( j == this.lastRangeCellIndex ){
							cell.className = 'rightborderSelectedCell';	
						}			
					
						if( i == this.firstRangeRowIndex && j == this.firstRangeCellIndex )
							cell.className = 'topleftSelectedCell';
						else if( i == this.firstRangeRowIndex  && j == this.lastRangeCellIndex )
							cell.className = 'toprightSelectedCell';
						else if( i == this.lastRangeRowIndex && j == this.firstRangeCellIndex )
							cell.className = 'bottomleftSelectedCell';
						else if( i == this.lastRangeRowIndex && j == this.lastRangeCellIndex )
							cell.className = 'bottomrightSelectedCell';
					}
					else if( this.lastRangeRowIndex - this.firstRangeRowIndex == 0 && this.lastRangeCellIndex - this.firstRangeCellIndex >= 1){
						cell.className = 'singlerowtopbottomborderSelectedCell';	
										
						if( j == this.firstRangeCellIndex ){
							cell.className = 'singlerowleftSelectedCell';	
						}else if( j == this.lastRangeCellIndex ){
							cell.className = 'singlerowrightSelectedCell';	
						}			
					}
					else if( this.lastRangeRowIndex - this.firstRangeRowIndex >= 1 && this.lastRangeCellIndex - this.firstRangeCellIndex == 0){
						cell.className = 'singlecolumnleftrightborderSelectedCell';	
						
						if( i == this.firstRangeRowIndex ){
							cell.className = 'singlecolumntopSelectedCell';	
						}else if( i == this.lastRangeRowIndex ){
							cell.className = 'singlecolumnbottomSelectedCell';	
						}		
					}
					else if( this.lastRangeRowIndex - this.firstRangeRowIndex == 0 && this.lastRangeCellIndex - this.firstRangeCellIndex == 0){
						cell.className = 'slctedSprCell';		
					}
						
					this.selectedCells.push(cell);				
				}
			}
		}
	};
	
	Spreadsheet.prototype.formKeyDown = function(event) {
		
		if (this.firstSelectedCell != null) {				
		
			var formTable = document.getElementById('rightTableWithRows');

			var cellX = this.firstSelectedCell.cellIndex;
			var cellY = this.firstSelectedCell.parentElement.rowIndex;

			var xComp = 0;
			var yComp = 0;

			if (event.keyCode == 37) {
				if (cellX > 0)
					xComp = -1;
			} else if (event.keyCode == 38 ) {
				if (cellY > 1)
					yComp = -1;
			} else if (event.keyCode == 39) {
				if (cellX < formTable.rows[0].cells.length - 1)
					xComp = 1;
			} else if (event.keyCode == 40 || event.keyCode == 13 ) {
				if (cellY < formTable.rows.length - 1)
					yComp = 1;
			}

			var cell = formTable.rows[cellY + yComp].cells[cellX + xComp];

			for ( var i = 0; i < this.selectedCells.length; i++) {
				if( this.selectedCells[i].className == 'slctedSprCell' ){
					this.selectedCells[i].className = 'sprCell';
				}
			}

			this.selectedCells.splice(0, this.selectedCells.length);
			this.selectedCells.push(cell);

			cell.className = 'slctedSprCell';
			this.firstSelectedCell = cell;
			var horScrollDiv = document.getElementById('scrollRightTbl'); 
				
			var cellTop = util.top(cell);	
			var cellLeft = util.left(cell);						
			var cellRight = util.right(cell);
			var cellBottom =  util.bottom(cell);
			
			var tableTop = util.top(horScrollDiv);
			var tableLeft = util.left(horScrollDiv);
			var tableRight = util.right(horScrollDiv);
			var tableBottom = util.bottom(horScrollDiv);
									
			if( event.keyCode == 39 &&  cellRight > tableRight-25 )
				horScrollDiv.scrollLeft = horScrollDiv.scrollLeft + cellRight + 35 - tableRight;
			else if( event.keyCode == 37 &&  cellLeft < tableLeft )
				horScrollDiv.scrollLeft = horScrollDiv.scrollLeft - (tableLeft-cellLeft) - 10 ;
					
			if( event.keyCode == 38 &&  cellTop < tableTop )
				horScrollDiv.scrollTop = horScrollDiv.scrollTop - (tableTop - cellTop) - 10;
			else if( (event.keyCode == 40 || event.keyCode == 13) && cellBottom > tableBottom - 25 ){
				horScrollDiv.scrollTop = horScrollDiv.scrollTop + 25 + cellBottom - tableBottom ;
			}
		}
	};
	
	Spreadsheet.prototype.write = function() {					
		if (this.focusedCell == null || this.firstSelectedCell != this.focusedCell ) {				
			this.focusByKey(this.firstSelectedCell);
		}						
	};
	
	Spreadsheet.prototype.copy = function(){
		var copyContent = '';
		var table = document.getElementById("rightTableWithRows");

		for ( var i = 0; i < table.rows.length; i++) {
			var row = table.rows[i];
			var firstSelectedCellInRow = true;

			for ( var j = 0; j < row.cells.length; j++) {
				try {
					var cell = row.cells[j];

					if ( selectedClassNames.indexOf(cell.className) != -1  ) {
						if (firstSelectedCellInRow == true) {											
							firstSelectedCellInRow = false;
							copyContent = copyContent + (cell.children.length > 0 ? cell.children[0].value :  cell.innerHTML );							
						} else {						
							copyContent = copyContent + String.fromCharCode(9) + (cell.children.length > 0 ? cell.children[0].value :  cell.innerHTML );						
						}
					}
				} catch (err) {
					console.log('ERROR : '+ err);
				}
			}

			if (firstSelectedCellInRow == false) {
				copyContent = copyContent + String.fromCharCode(13);
			}
		}

		spreadsheet.copyContent = copyContent;		
		return false;					
	};
	
	Spreadsheet.prototype.paste = function(){
		
		var objRowIndex = this.firstSelectedCell.parentNode.rowIndex;
		var objCellIndex = this.firstSelectedCell.cellIndex;
		
		var content = this.copyContent;
			
		var rows = content.split(String.fromCharCode(13));
		var table = document.getElementById("rightTableWithRows");
		var rowLimit = objRowIndex + rows.length - 1;
		
		for ( var i = objRowIndex, row, k = 0; i < rowLimit; i++, k++) {
			try {
				row = table.rows[i];
				var cols = rows[k].split(String.fromCharCode(9));
				var cellLimit = objCellIndex + cols.length;

				for ( var j = objCellIndex, col, l = 0; j < cellLimit; j++, l++) {
					col = row.cells[j];
					col.innerHTML = cols[l];
				}
			} catch (err) {
				console.log('ERROR : '+err);
			}
		}
		
		this.copyContent = null;
	};
	
	//Here needs to be improved
	Spreadsheet.prototype.runMozillaPaste = function(){		
		if( this.firstSelectedCell != null ){
			var pasteTextArea=document.getElementById("ta");
			pasteTextArea.focus();
			pasteTextArea.select();
		}
	};
};		

function adjustHeights(leftTableId,rightTableId){
	rightTableRows = document.getElementById(rightTableId).rows;
	leftTableRows = document.getElementById(leftTableId).rows;

	if( leftTableRows.length != rightTableRows.length )
		alert('Error in data structure: Number of rows does not match ');

	leftRow = leftTableRows[0];
	rightRow = rightTableRows[0];
	leftRow.style.height = (rightRow.offsetHeight+1)+'px';				
}

function equalizeHeights(leftTableId,rightTableId){
	rightTableRows = document.getElementById(rightTableId).rows;
	leftTableRows = document.getElementById(leftTableId).rows;

	if( leftTableRows.length != rightTableRows.length )
		alert('Error in data structure: Number of rows does not match ');

	for(var i=0; i<rightTableRows.length; i++ ){
		leftRow = leftTableRows[i];
		rightRow = rightTableRows[i];
		if( leftRow.offsetHeight > rightRow.offsetHeight ){
			rightRow.style.height = leftRow.offsetHeight+'px';
		}else if( leftRow.offsetHeight < rightRow.offsetHeight  ){
			leftRow.style.height = rightRow.offsetHeight+'px';
		}
	}
}

//Sometimes wrapping causes change in line heights
function equalizeContentDependentHeights(){
	equalizeHeights('leftHeaderTable','rightHeaderTable');
	adjustHeights('leftHeaderTable','rightHeaderTable');
	equalizeHeights('leftTable','rightTableWithRows');
}

function attachScrollStablerEvents(){
	var scrollRightTbl = document.getElementById('scrollRightTbl');
	var handler = function(event){
		var scrollRightTbl = document.getElementById('scrollRightTbl');
		var scrollableLeftDiv = document.getElementById('scrollableLeftDiv');
		var scrollableHeadDiv = document.getElementById('scrollableHeadDiv');
		scrollableLeftDiv.scrollTop = scrollRightTbl.scrollTop;
		scrollableHeadDiv.scrollLeft = scrollRightTbl.scrollLeft;
	};
	util.addEvent(scrollRightTbl,'scroll',handler);
}

function attachScrollStablerEvents(){
	var scrollRightTbl = document.getElementById('scrollRightTbl');
	var handler = function(event){
		var scrollRightTbl = document.getElementById('scrollRightTbl');
		var scrollableLeftDiv = document.getElementById('scrollableLeftDiv');
		var scrollableHeadDiv = document.getElementById('scrollableHeadDiv');
		scrollableLeftDiv.scrollTop = scrollRightTbl.scrollTop;
		scrollableHeadDiv.scrollLeft = scrollRightTbl.scrollLeft;
	};
	util.addEvent(scrollRightTbl,'scroll',handler);
}	

function attachMouseEvents(){
	var getCell = function(event){
		var cell = util.getEventTarget(event);
		if( cell.nodeName == 'INPUT' )
			cell = cell.parentElement;
		return cell;
	};
				
	var mousedownHandler = function(event){
		var focusedCell = spreadsheet.focusedCell;
		var eventCell = getCell(event);
		spreadsheet.mouseDown(eventCell,event.button);
		if(focusedCell != eventCell){
			if(event.preventDefault){ 
				event.preventDefault(); 
			}
		}
		
		return false;
	};	
	
	var mouseupHandler = function(event){
		spreadsheet.mouseUp(getCell(event));
	};
	
	var dblclickHandler = function(event){
		spreadsheet.focus( util.getEventTarget(event));
	};
	
	var selectionHandler = function(event){
		return false ;
	};
	
	var mousemoveHandler = function(event){
		spreadsheet.mouseMove( event.clientX, event.clientY );
	};
	
	var keyeventHandler = function(event){
		if (event.keyCode == 8) {
			event.keyCode = 0;
			return event.keyCode;
		}
		if (event.keyCode >= 37 && event.keyCode <= 40) {
			spreadsheet.formKeyDown(event);
			util.preventDefault(event);
		}
		if(event.keyCode == 13){ 
			spreadsheet.formKeyDown(event);
			util.preventDefault(event);
		}
		if (event.keyCode == 67) {
			if (event.ctrlKey) 
				copy();		
			util.preventDefault(event);
		}
		if (event.keyCode == 86) {
			if (event.ctrlKey){
				spreadsheet.runMozillaPaste();
				
				return event.keyCode;
			}
			util.preventDefault(event);
		}
		if( event.keyCode > 46 && event.keyCode < 91 ){
			spreadsheet.write();
		}				
	};
	
	var pasteHandler = function(e){
		if (e.clipboardData) {
			var text = e.clipboardData.getData('text/plain');
			spreadsheet.copyContent = text;
			spreadsheet.paste();
		}
	};
	
	var changeHandler = function(e){
	};
	
	var spreadsheetDiv = document.getElementById("container");
	var spreadsheetTable = document.getElementById("rightTableWithRows");			
	var pasteArea = document.getElementById("ta");
	
	util.addEvent(spreadsheetTable,'dblclick',dblclickHandler);
	util.addEvent(spreadsheetTable,'mousedown',mousedownHandler);
	
	util.addEvent(spreadsheetTable,'mouseup',mouseupHandler);
	util.addEvent(spreadsheetTable,'selectstart',selectionHandler);						
	util.addEvent(document,'keydown',keyeventHandler);		
	util.addEvent(window,'paste',pasteHandler);
	util.addEvent(pasteArea,'change',changeHandler);
}

function buildContextMenu() {			
	rightclickPanel = new RightclickPanel( "rightTableWithRows", "contextMenu");
	var menu = document.getElementById('contextMenu');
	
	util.addEvent(menu, 'mousedown', function(e) {
		var target = util.getEventTarget(e);

		if (target.innerHTML == 'Copy') {
			spreadsheet.copy();
		} else if (target.innerHTML == 'Paste') {
			spreadsheet.paste();
			return false;
		}

		util.preventDefault(e);
		return false;
	});
}

var disableEvent = function(e) {
	util.preventDefault(e);
}

function buildSpreadsheet( dataObject ){	


	var container = document.getElementById('spreadsheet');	
	container.style.width = '100%';	
	container.style.height = '100%';
	
	container.style ='font-family: Arial;';
	
	var content = '<ul style="left: 147px; top: 236px; display: none;" id="contextMenu" oncontextmenu="disableEvent(event);"   >'+
					  '<li oncontextmenu="disableEvent(event);" >'+
						  '<a href="#" oncontextmenu="disableEvent(event);" style="font-weight: bold;" >Copy</a>'+
					  '</li>'+
					  '<li oncontextmenu="disableEvent(event);" >'+
						  '<a href="#" oncontextmenu="disableEvent(event);" style="font-weight: bold;" >Paste</a>'+
					  '</li>'+			
				  '</ul>'+
	
					'<div style="position: relative; clear: both; width: 100%; height: 100%;">'+
						'<div style="position:absolute; top:0; left:0;">'+
							'<div style="position:relative; top:0; left:0; overflow:hidden;" ></div>'+
							'<div style="position:relative; top:0; left:0; overflow:hidden;" ></div>'+
						'</div>'+
						'<div style="position: absolute; top: 0px; left: 0px; width: 100px; height: 100%; " >'+
							'<div style="position:relative; top:0; left:0; overflow:hidden; " >'+
								'<table cellspacing="0" cellpadding="0" border="0"  id="leftHeaderTable" style="width: 100%; font-size: 16px; empty-cells: show; ">'+
									'<thead>'+
										'<tr style="height: 26px;">'+
											'<th rowspan="1" colspan="1" style=" border: solid #B1B5BA 1px; background-color: #DFE3E8; font-size: 12px; " >'+dataObject.columns[0]+'</th>'+
										'</tr>'+
									'</thead>'+
								'</table>'+
							'</div>'+
							'<div style="position: relative; top: 0px; left: 0px; overflow: hidden; height: 100%" id="scrollableLeftDiv" >'+
								'<table cellspacing="0" cellpadding="0" border="0" id="leftTable" style="width: 100%; padding-bottom: 17px; margin-bottom: 34px; font-size: 12px; empty-cells: show; ">'+
									'<thead>'+
										'<tr style="height: 0px;"></tr>'+
									'</thead>'+

									'<tbody >';
										
									console.log( dataObject.data.length );
									var tempStr = '';
									for(var i=0; i<dataObject.data.length; i++){	
										var row = dataObject.data[i];
										tempStr += '<tr style="height: 25px;" ><td style=" border: solid #B1B5BA 1px; border-top: none; padding-left: 5px; background-color: #DFE3E8; " >'+row[0]+'</td></tr>';
									}
									content = content + tempStr;		
									content = content +
		
									'</tbody>'+
								'</table>'+
							'</div>'+
						'</div>'+
		
						
		'<div  style="position: absolute; top: 0px; left: 100px; width: 100%; height: 100%;">'+
			'<div id="scrollableHeadDiv" style="overflow: hidden; position: relative; width: 100%;">'+
				'<div style="width: 941px; padding-right: 17px;">'+
					'<table cellspacing="0" cellpadding="0" id="rightHeaderTable" style="width: 941px; font-size: 12px; border-collapse: collapse; empty-cells: show; table-layout: fixed ">'+
						'<thead>'+
							'<tr style="height: 26px;">';								
								tempStr = '';
								for(var i=1; i<dataObject.columns.length; i++ ){
									tempStr += '<th rowspan="1" colspan="1" style="width: 120px; border: solid #B1B5BA 1px; border-left: none; background-color: #DFE3E8; ">'+dataObject.columns[i]+'</th>';
								
								}
							
								
						content = content + tempStr +'</tr>'+
						'</thead>'+
					'</table>'+
				'</div>'+
			'</div>'+

			'<div id="scrollRightTbl" style="overflow: auto; width: 100%; height: 100%;"  >'+
				'<table  cellspacing="0" cellpadding="0" border="0" id="rightTableWithRows" style="width: 941px; font-size: 12px; empty-cells: show; table-layout: fixed ">'+
					'<thead>'+
						'<tr style="height: 0px;">';
						
							tempStr = '';
							for(var i=1; i<dataObject.columns.length; i++ ){									
								tempStr += '<th rowspan="1" colspan="1" style="width: 120px; max-width: 120px; border: solid #B1B5BA 1px; border-left: none; border-bottom: none; border-top: none; "></th>';
							}
							
							content = content + tempStr +
						
							
						'</tr>'+
					'</thead>'+

					'<tbody >';
					tempStr = '';
					for(var i=0; i<dataObject.data.length; i++ ){
						tempStr += 
						'<tr style="height: 25px;">';
							for(var j=1; j<dataObject.columns.length; j++){
								tempStr += '<td class="sprCell" >'+dataObject.data[i][j]+'</td>';
							}
							
						tempStr += '</tr>';
					}
					
		content = content + tempStr +
		
					'</tbody>'+
				'</table>'+
			'</div>'+
		'</div>'+		
	'</div>';
	
	container.innerHTML = content;
	
	equalizeContentDependentHeights();
	attachScrollStablerEvents();
	attachMouseEvents();
	buildContextMenu();	
}