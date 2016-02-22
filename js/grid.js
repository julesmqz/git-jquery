function CPGrid(options){
    this._setOptions(options);
    this._init();
}

CPGrid.prototype._setOptions = function(options){
    this.$ = options.$ || null;
    if (this.$ != null) {
        this.container = this.$(options.container) || null;
        this.fixedContainer = this.container.children('.fixed:first') || null;
        this.fixedContainerWidth = options.fixedWidth || 300;
        this.columnsContainer = this.container.children('.fluid:first') || null;
        this.elementWidth = options.elementWidth || 280;
        this.displayElements = options.displayElements || 200;
        this.columnsContainerWidth = this.elementWidth * this.displayElements || this.elementWidth * 2;
        this.columns = this.columnsContainer.children('.element');
        this.elementMarginLeft = options.elementMarginLeft || 14;

        this._setOrder(this.columns);
    } else {
        throw "Please pass the jquery object into the options";
    }

};

CPGrid.prototype._setOrder = function(){
    this.order = Array.apply(null, {length: this.columns.length}).map(Number.call, Number);
    //console.log(this);
}

CPGrid.prototype._init = function(){
    this.container.css('display','flex');
    this.fixedContainer.css('width',this.fixedContainerWidth+'px');
    this.columnsContainer.css('width',this.columnsContainerWidth+'px');
    this.columnsContainer.css('display','flex');
    this.columnsContainer.css('overflow-x','hidden');

    var width = this.elementWidth - (this.elementMarginLeft*2);
    var realWidth = Math.round((width/10))* 10;
    var columnsLength = this.columns.length;
    for( var i = 0; i <= columnsLength; i++){
        var column = this.$(this.columns[i]);
        column.css('min-width',realWidth+'px');
        column.css('margin-left',this.elementMarginLeft+'px');
        column.css('order',this.order[i]);
        this._setColumnLinks(column,i);
    }
};

CPGrid.prototype._setColumnLinks = function(column,order){
    var i = order;
    var prev = column.children('.prev:first');
    var next = column.children('.next:first');

    prev.attr('data-order',i-1);
    next.attr('data-order',i+1);
};

CPGrid.prototype.changeColumn = function(actualColumn,newColumn){
    if( newColumn >= 0 && newColumn <= this.columns.length -1 ){
        console.log('change column');
        var actual = this.$(this.columns[actualColumn]);
        var niu = this.$(this.columns[newColumn]);

        this.columns[actualColumn] = niu;
        this.columns[newColumn] = actual;

        var actualOrder = parseInt(actual.css('order'));
        var niuOrder = parseInt(niu.css('order'));

        actual.css('order',niuOrder);
        niu.css('order',actualOrder);

        this._setColumnLinks(actual,niuOrder);
        this._setColumnLinks(niu,actualOrder);
    }
};

CPGrid.prototype.move = function(action,cb){
    var vm = this;
    switch(action){
        case 'right':
            console.log('right');
            var leftPos = this.columnsContainer.scrollLeft();
            var totalWidth = (this.columns.length - 1) * this.elementWidth;
            var other = totalWidth-(this.elementWidth*(this.displayElements));
            console.log(this.columns.length,totalWidth, other,leftPos);


            var canKeepMoving = other != (leftPos);
            if( totalWidth > (leftPos) ) {

                if( !this.moving ){
                    console.log('move');
                    this.moving = true;
                    this.columnsContainer.animate({
                        scrollLeft: leftPos + this.elementWidth
                    }, 300,function(){
                        vm.moving = false;
                        cb.apply(vm,[vm.moving,canKeepMoving]);
                    });
                }else{
                    cb.apply(vm,[vm.moving,canKeepMoving]);
                }

            }else{
                cb.apply(this,[this.moving,canKeepMoving]);
            }
            break;
        case 'left':
            console.log('left');
            var leftPos = this.columnsContainer.scrollLeft();
            var canKeepMoving = (leftPos - this.elementWidth) > 0
            if( leftPos > 0){
                if( !this.moving ){
                    console.log('move');
                    this.moving = true;
                    this.columnsContainer.animate({
                        scrollLeft: leftPos - this.elementWidth
                    }, 300,function(){
                        vm.moving = false;
                        cb.apply(vm,[vm.moving,canKeepMoving]);
                    });
                }else{
                    cb.apply(vm,[vm.moving,canKeepMoving]);
                }

            }else{
                cb.apply(this,[this.moving,canKeepMoving]);
            }
            break;
        default:
            throw "Not valid action";
            break;
    }
}