/**
 * Constructor
 *
 * @param options json object with options to init
 * @constructor
 */
function CPGrid(options) {
    this._setOptions(options);
    this._init();
}

/**
 * Restarts the grid with some options
 * @param options
 */
CPGrid.prototype.restart = function(options){
    this._setOptions(options);
    this._init();
}

/**
 * Sets the options used by all the app
 *
 * @param options JSON object
 * @private
 */
CPGrid.prototype._setOptions = function (options) {
    this.$ = options.$ || null;
    if (this.$ != null) {
        this.container = this.$(options.container) || null;
        this.fixedContainer = this.container.children('.cpgrid-fixed:first') || null;
        this.fixedContainerWidth = options.fixedWidth || 300;
        this.columnsContainer = this.container.children('.cpgrid-fluid:first') || null;
        this.displayElements = options.displayElements || 2;

        this.columns = this.columnsContainer.children('.element');
        this.elementMarginLeft = options.elementMarginLeft || 14;

        if (options.forceValues) {
            this.elementWidth = options.forceValues.elementWidth;
            this.elementRealWidth = options.forceValues.elementRealWidth;
            this.columnsContainerWidth = options.forceValues.fluidWidth;
        } else {
            //this.fullColumnsContainerWidth=false;
            this.elementWidth = options.elementWidth || 280;
            this.columnsContainerWidth = this.elementWidth * this.displayElements || this.elementWidth * 2;
        }
        this.noFixElementWidth = options.noFixElementWidth || false;
        this.store = options.store || null;
        this.storeKey = 'cpgridorder';


        this._setOrder();
    } else {
        throw "Please pass the jquery object into the options";
    }

};

/**
 * Gets the order for the grid columns via localstorage or creates it.
 * @private
 */
CPGrid.prototype._setOrder = function () {
    if (this.store != null) {
        //Check if data exists
        this.store.get(this.storeKey, function (success, val) {
            //console.log('Retrieve', val);
            if (val) {
                this.order = JSON.parse(val);
                if( this.order.length > this.columns.length ){
                    this.order = Array.apply(null, {length: this.columns.length}).map(Number.call, Number);
                }
            } else {
                this.order = Array.apply(null, {length: this.columns.length}).map(Number.call, Number);
            }
        }.bind(this));


    } else {
        this.order = Array.apply(null, {length: this.columns.length}).map(Number.call, Number);
    }

    //console.log(this);
}


/**
 * Saves the order on the localstorage. If localstorage is not available does nothing.
 * @private
 */
CPGrid.prototype._saveOrder = function () {
    if (this.store != null) {

        var order = [];
        var columns = this.columnsContainer.children('.element');
        var columnsLength = columns.length;
        for (var i = 0; i < columnsLength; i++) {
            var column = this.$(columns[i]);
            order.push(parseInt(column.css('order')));
        }

        //console.log('SAVE', order);
        this.store.set(this.storeKey, JSON.stringify(order));
        this.store.save();
        this.order = order;


    }
};

/**
 * Initializes the application by setting styles on the grid and columns.
 * @private
 */
CPGrid.prototype._init = function () {
    this.container.css('display', 'flex');
    this.fixedContainer.css('width', this.fixedContainerWidth + 'px');
    this.columnsContainer.css('min-width', this.columnsContainerWidth + 'px');
    this.columnsContainer.css('max-width', this.columnsContainerWidth + 'px');
    this.columnsContainer.css('width', this.columnsContainerWidth + 'px');
    this.columnsContainer.css('display', 'flex');
    this.columnsContainer.css('overflow-x', 'hidden');

    var width = this.elementWidth - (this.elementMarginLeft * 2);
    if (!this.elementRealWidth) {
        var realWidth = Math.round((width / 10)) * 10;
    } else {
        var realWidth = this.elementRealWidth;
    }
    //console.log(this.elementWidth,this.elementMarginLeft*2,width,realWidth);
    var columnsLength = this.columns.length;
    for (var i = 0; i < columnsLength; i++) {
        var column = this.$(this.columns[i]);
        column.css('min-width', realWidth + 'px');
        column.css('max-width', realWidth + 'px');
        column.css('width', realWidth + 'px');
        column.css('margin-left', this.elementMarginLeft + 'px');
        column.css('order', this.order[i]);
        this._setColumnLinks(column, this.order[i]);
    }
};

/**
 * Sets columns prev and next links for them to be able to change position.
 *
 * @param column DOM object
 * @param order integer
 * @private
 */
CPGrid.prototype._setColumnLinks = function (column, order) {
    var i = order;
    var tools = column.children('.cpgrid-tools');
    var prev = tools.children('.prev:first');
    var next = tools.children('.next:first');
    //console.log(column,tools,prev,next);
    if ((i - 1) == -1) {
        prev.addClass('disabled');
    } else {
        prev.removeClass('disabled');
    }
    if ((i + 1) == this.columns.length) {
        next.addClass('disabled');
    } else {
        next.removeClass('disabled');
    }
    prev.attr('data-order', i - 1);
    next.attr('data-order', i + 1);
};

/**
 * Changes position of the columns
 *
 * @param actualColumn integer
 * @param newColumn integer
 */
CPGrid.prototype.changeColumn = function (actualColumn, newColumn) {

    if (newColumn >= 0 && newColumn <= this.columns.length - 1) {
        //console.log('change column',actualColumn,newColumn);
        var key1 = this.order.indexOf(actualColumn);
        var key2 = this.order.indexOf(newColumn);
        //console.log('change keys',key1,key2);

        var column1 = this.columns[key1];
        var column2 = this.columns[key2];

        var actual = this.$(column1);
        var niu = this.$(column2);

        //console.log(this.columns);

        //this.columns[key1] = column2;
        //this.columns[key2] = column1;

        //console.log(this.columns);

        var actualOrder = parseInt(actual.css('order'));
        var niuOrder = parseInt(niu.css('order'));

        /*this.order[actualColumn] = niuOrder;
         this.order[newColumn] = actualOrder;*/

        actual.css('order', niuOrder);
        niu.css('order', actualOrder);

        //console.log(niuOrder,actualOrder);

        this._setColumnLinks(actual, niuOrder);
        this._setColumnLinks(niu, actualOrder);

        this._saveOrder();
    }
};

/**
 * Scrolls entire grid
 * @param action right|left only
 * @param cb Function
 */
CPGrid.prototype.move = function (action, cb) {
    var vm = this;
    switch (action) {
        case 'right':
            //console.log('right');
            var leftPos = this.columnsContainer.scrollLeft();
            var totalWidth = (this.columns.length - 1) * this.elementWidth;
            var other = totalWidth - (this.elementWidth * (this.displayElements));
            //console.log(this.columns.length,totalWidth, other,leftPos);


            var canKeepMoving = other != (leftPos) && leftPos < other;
            if (totalWidth > (leftPos)) {

                if (!this.moving) {
                    //console.log('move');
                    this.moving = true;
                    this.columnsContainer.animate({
                        scrollLeft: leftPos + this.elementWidth
                    }, 300, function () {
                        vm.moving = false;
                        cb.apply(vm, [vm.moving, canKeepMoving]);
                    });
                } else {
                    cb.apply(vm, [vm.moving, canKeepMoving]);
                }

            } else {
                cb.apply(this, [this.moving, canKeepMoving]);
            }
            break;
        case 'left':
            //console.log('left');
            var leftPos = this.columnsContainer.scrollLeft();
            var canKeepMoving = (leftPos - this.elementWidth) > 0
            if (leftPos > 0) {
                if (!this.moving) {
                    //console.log('move');
                    this.moving = true;
                    this.columnsContainer.animate({
                        scrollLeft: leftPos - this.elementWidth
                    }, 300, function () {
                        vm.moving = false;
                        cb.apply(vm, [vm.moving, canKeepMoving]);
                    });
                } else {
                    cb.apply(vm, [vm.moving, canKeepMoving]);
                }

            } else {
                cb.apply(this, [this.moving, canKeepMoving]);
            }
            break;
        default:
            throw "Not valid action";
            break;
    }
}