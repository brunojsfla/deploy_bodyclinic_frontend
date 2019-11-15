(function(){
    app.component('headerformComponent', {
        bindings:{
            text:'@'
        },
        template:`
        <div class="box-header with-border">
            <h3 class="box-title">{{ $ctrl.text }}</h3>
        </div>
        `
    });
})()
