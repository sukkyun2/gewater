$(document).ready(function() {
    // 스크롤 이벤트
    $(window).scroll(function() {
        if ($(this).scrollTop() > 100) {
            $('.top').fadeIn();
        } else {
            $('.top').fadeOut();
        }
    });

    // 상단 이동 버튼 클릭 이벤트
    $('.top').click(function(e) {
        e.preventDefault();
        $('html, body').animate({ scrollTop: 0 }, '300');
    });

    // 네비게이션 고정값
    var $header = $('#header'); 
    var originalPosition = $header.css('position'); 

    $(window).on('scroll', function() {
        var scrollTop = $(this).scrollTop();

        if (scrollTop > 0) {
            $header.css({
                'position': 'fixed',
                'top': '0',
                'background': '#fff',
                'width': '100%',
                'z-index': '1000'
            });
        } else {
            $header.css({
                'position': originalPosition,
                'top': ''
            });
        }
    });

    // 사이트맵 열기/닫기
    $('#header .open').on('click', function(e) {
        e.preventDefault();
        $('#siteMap').addClass('open');
    });

    $('#siteMap .button, #siteMap').on('click', function(e) {
        if ($(e.target).is('#siteMap') || $(e.target).is('.button')) {
            e.preventDefault();
            $('#siteMap').removeClass('open');
        }
    });

    // Slick 슬라이더 초기화
    $('.your-class').slick({
        autoplay: true,       
        dots: false,            
        arrows: true,        
        infinite: true,        
        speed: 500,           
        slidesToShow: 1,      
        slidesToScroll: 1,      
        fade: true,           
        cssEase: 'linear',   
        prevArrow: $('.prevArrow'), 
        nextArrow: $('.nextArrow'), 
    });

    // 슬라이더와 동그라미 버튼 연동
    $('.slider a').on('click', function(e) {
        e.preventDefault();
        var index = $(this).index();
        $('.your-class').slick('slickGoTo', index);
    });

    $('.your-class').on('afterChange', function(event, slick, currentSlide) {
        $('.slider a').removeClass('on');
        $('.slider a').eq(currentSlide).addClass('on');
    });
});
