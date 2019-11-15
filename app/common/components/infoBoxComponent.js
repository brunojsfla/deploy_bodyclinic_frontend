(function(){
    app.component('infoboxComponent', {
        bindings:{
            grid:'@',
            color:'@',
            icon:'@',
            title:'@',
            text:'@',
            reference:'@',
            whatsapp:'@',
            iconWhatsapp:'@',
            textWhatsapp:'@',
            mail:'@',
            iconMail:'@',
            textMail:'@'
        },
        template:`
        <div class="{{ $ctrl.grid }}">
            <div class="info-box">
                <span class="info-box-icon bg-{{ $ctrl.color }}">
                    <i class="fa {{ $ctrl.icon }}"></i>
                </span>
                <div class="info-box-content">
                    <span class="info-box-text"><b><u>{{ $ctrl.title }}</u></b></span>
                    <span class="info-box-text"><b>{{ $ctrl.text }}</b></span>
                    <a {{ $ctrl.reference }}"{{ $ctrl.whatsapp }}" target="_blank">
                        <span class="info-box-text"><i class="fa {{ $ctrl.iconWhatsapp }}"></i> {{ $ctrl.textWhatsapp }}</span>
                    </a>
                    <a {{ $ctrl.reference }}"{{ $ctrl.mail }}" target="_blank">
                        <span class="info-box-text"><i class="fa {{ $ctrl.iconMail }}"></i> {{ $ctrl.textMail }}</span>
                    </a>
                </div>
            </div>
        </div>`
    });
})()
