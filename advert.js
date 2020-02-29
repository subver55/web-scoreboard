var jsAdverts = [
  {
    hdr:"Школа картинга",
    content:"Круглый год обучаем грамотному и безопасному управлению картов, помогаем найти самую быструю траекторию, оттачиваем технику стартов и обгонов!<br>\
		Мы уделяем особое внимание каждому ученику, что позволяет улучшить технику, скорость, мышление пилота в самые короткие сроки."
  },
  {
    hdr:"Любительские соревнования",
    content:"Каждый из Вас может принять участие в настоящих международных соревнованиях Sodi World Series! <br>\
		 Категория Junior Cup для пилотов от 7 до 14 лет.<br>\
		Категория Sprint Cup для пилотов от 15 лет и старше.<br>\
		Карт и экипировка входит в стоимость участия!"
  }
];

function loadAdvert()
{
  var advDiv = document.getElementById("advertisment");
  var advContainer = document.getElementById("advert");
  if(advDiv!=null)
  {
    for(let adv of jsAdverts)
    {
      var a = advContainer.cloneNode(true);
      var hdr = a.querySelector(".advertHeader");
      if(hdr)
      {
        hdr.innerHTML = adv.hdr;
      }
      var content = a.querySelector(".advertContent");
      if(content)
      {
        content.innerHTML = adv.content;
      }
      advDiv.appendChild(a);
    }
  }
}
