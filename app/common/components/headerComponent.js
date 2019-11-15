(function(){
    app.component('headerComponent', {
        bindings: {
            title: '@',
            sub: '@'
        },
        template: `
        <section class="content-header">
            <h1>{{ $ctrl.title }} <small>{{ $ctrl.sub }}</small></h1>
        </section>`
    });
})()
