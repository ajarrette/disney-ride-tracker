begin;

update public.rides as rides
set
  logo_path = images.logo_path,
  background_path = images.background_path
from (
  values
    (
      'epcot-canada-far-and-wide',
      'epcot/rides/canada-far-and-wide-logo.jpg',
      'https://cdn1.parksmedia.wdprapps.disney.com/resize/mwImage/1/630/354/75/dam/disney-world/attractions/epcot/canada-far-and-wide/canada-far-and-wide-16x9.jpg?1699632674324'
    ),
    (
      'epcot-impressions-de-france',
      'epcot/rides/impressions-de-france-logo.jpg',
      'https://cdn1.parksmedia.wdprapps.disney.com/resize/mwImage/1/630/354/75/dam/wdpro-assets/gallery/attractions/epcot/impressions-de-france/impressions-de-france-gallery01.jpg?1778399052917'
    ),
    (
      'epcot-turtle-talk-with-crush',
      'epcot/rides/turtle-talk-with-crush-logo.jpg',
      'https://cdn1.parksmedia.wdprapps.disney.com/resize/mwImage/1/630/354/75/dam/wdpro-assets/gallery/attractions/epcot/turtle-talk-with-crush/turtle-talk-with-crush-gallery01.jpg?1768218439204'
    ),
    (
      'epcot-reflections-of-china',
      'epcot/rides/reflections-of-china-logo.jpg',
      'https://cdn1.parksmedia.wdprapps.disney.com/resize/mwImage/1/630/354/75/dam/wdpro-assets/gallery/attractions/epcot/reflections-of-china/reflections-of-china-gallery01.jpg?1699632702275'
    )
) as images(id, logo_path, background_path)
where rides.id = images.id;

commit;