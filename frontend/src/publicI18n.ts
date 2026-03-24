import type { PublicLang } from './publicLang';

type Dict = Record<string, string>;

type I18n = Record<PublicLang, Dict>;

const DICT: I18n = {
  en: {
    nav_movies: 'Movies',
    nav_series: 'Series',
    nav_news: 'News',
    nav_people: 'People',
    search_placeholder: 'Search',
    theme_label: 'Theme',

    refresh: 'Refresh',
    reset: 'Reset',
    prev: 'Prev',
    next: 'Next',
    back: 'Back',

    filters: 'Filters',
    release_date: 'Release date',
    sort: 'Sort',
    status: 'Status',

    status_all: 'All',
    status_upcoming: 'Upcoming',
    status_ongoing: 'Ongoing',
    status_ended: 'Ended',

    sort_latest: 'Latest',
    sort_oldest: 'Oldest',
    sort_title_asc: 'Title A–Z',
    sort_title_desc: 'Title Z–A',

    showing: 'Showing',
    of: 'of',
    page: 'Page',

    loading: 'Loading…',
    not_found: 'Not found.',

    movies_title: 'Movies',
    movies_sub: 'Browse all movies in your database.',
    movies_empty: 'No movies found.',

    series_title: 'Series',
    series_sub: 'Browse all series in your database.',
    series_empty: 'No series found.',

    news_title: 'News',
    news_sub: 'Latest announcements and updates.',
    news_empty: 'No news yet.',

    title_overview: 'Overview',
    title_no_synopsis: 'No synopsis yet.',
    title_directors: 'Directors',
    title_no_directors: 'No directors attached.',
    title_top_cast: 'Top cast',
    title_no_cast: 'No cast attached.',
    title_cast_fallback: 'Cast',

    poster_fallback: 'No poster',
    release_chip: 'Release',
    type_chip: 'Type',
    duration_chip: 'Duration',
    seasons_chip: 'Seasons',
    series_status_chip: 'Status',

    type_movie: 'Movie',
    type_series: 'Series',
    type_media: 'Media',
    unit_min: 'min',

    role_director: 'Director',
    role_actor: 'Actor',

    homepage_subtitle: 'Web Platform for Promoting Moldovan Cinema',
    homepage_admin: 'Admin',
    homepage_featured: 'Featured',
    homepage_featured_desc: 'Admin-curated highlights. A few picks worth your attention.',
    homepage_latest_movies: 'Latest Movies',
    homepage_latest_series: 'Latest Series',
    homepage_recently_added: 'Recently added',
    homepage_upcoming_movies: 'Upcoming Movies',
    homepage_upcoming_series: 'Upcoming Series',
    homepage_coming_soon: 'Coming soon',
    homepage_hero_note:
      'A platform dedicated to Moldovan films and TV series: what is already released, what is coming soon, and detailed pages for every title. The content is managed through an admin panel, helping to organize and surface Moldovan cinema.',

    people_title: 'People',
    people_sub: 'Actors and other people in your database.',
    people_empty: 'No people yet.',

    profile_biography: 'Biography',
    profile_no_bio: 'No biography yet.',
    profile_filmography: 'Filmography',
    profile_no_titles: 'No titles yet.',
    profile_no_image: 'No image',
    profile_born: 'Born',
    profile_gender: 'Gender',
    profile_place_of_birth: 'Place of birth',
    profile_earnings: 'Earnings',

    gender_male: 'Male',
    gender_female: 'Female',
    gender_unspecified: 'Unspecified',

    news_summary: 'Summary',
    news_content: 'Content',

    menu_login: 'Login',
    menu_logout: 'Logout',
    menu_bookmarks: 'Bookmarks',
    menu_admin: 'Admin',
    menu_continue_google: 'Continue with Google',
    menu_admin_login: 'Admin login',

    role_user: 'User',
    role_admin: 'Admin',

    bookmarks_title: 'Bookmarks',
    bookmarks_sub: 'Your saved titles (movies and series).',
    bookmarks_empty: 'No bookmarks yet.',
    bookmarks_search_title: 'Search title',
    bookmarks_all: 'All',
    bookmarks_newest: 'Newest',
    bookmarks_oldest: 'Oldest',
  },
  ro: {
    nav_movies: 'Filme',
    nav_series: 'Seriale',
    nav_news: 'Noutăți',
    nav_people: 'Persoane',
    search_placeholder: 'Căutare',
    theme_label: 'Temă',

    refresh: 'Reîmprospătează',
    reset: 'Resetează',
    prev: 'Înapoi',
    next: 'Înainte',
    back: 'Înapoi',

    filters: 'Filtre',
    release_date: 'Data lansării',
    sort: 'Sortare',
    status: 'Stare',

    status_all: 'Toate',
    status_upcoming: 'În curând',
    status_ongoing: 'În desfășurare',
    status_ended: 'Încheiat',

    sort_latest: 'Cele mai noi',
    sort_oldest: 'Cele mai vechi',
    sort_title_asc: 'Titlu A–Z',
    sort_title_desc: 'Titlu Z–A',

    showing: 'Afișate',
    of: 'din',
    page: 'Pagina',

    loading: 'Se încarcă…',
    not_found: 'Nu a fost găsit.',

    movies_title: 'Filme',
    movies_sub: 'Răsfoiește toate filmele din baza de date.',
    movies_empty: 'Nu s-au găsit filme.',

    series_title: 'Seriale',
    series_sub: 'Răsfoiește toate serialele din baza de date.',
    series_empty: 'Nu s-au găsit seriale.',

    news_title: 'Noutăți',
    news_sub: 'Anunțuri și actualizări recente.',
    news_empty: 'Nu există noutăți încă.',

    title_overview: 'Prezentare',
    title_no_synopsis: 'Nu există descriere încă.',
    title_directors: 'Regizori',
    title_no_directors: 'Nu sunt atașați regizori.',
    title_top_cast: 'Distribuție',
    title_no_cast: 'Nu este atașată distribuție.',
    title_cast_fallback: 'Distribuție',

    poster_fallback: 'Fără poster',
    release_chip: 'Lansare',
    type_chip: 'Tip',
    duration_chip: 'Durată',
    seasons_chip: 'Sezoane',
    series_status_chip: 'Stare',

    type_movie: 'Film',
    type_series: 'Serial',
    type_media: 'Media',
    unit_min: 'min',

    role_director: 'Regizor',
    role_actor: 'Actor',

    homepage_subtitle: 'Platformă web pentru promovarea cinematografiei din Moldova',
    homepage_admin: 'Admin',
    homepage_featured: 'Recomandate',
    homepage_featured_desc: 'Selecție curatoriată de admin. Câteva titluri care merită atenția ta.',
    homepage_latest_movies: 'Filme noi',
    homepage_latest_series: 'Seriale noi',
    homepage_recently_added: 'Adăugate recent',
    homepage_upcoming_movies: 'Filme în curând',
    homepage_upcoming_series: 'Seriale în curând',
    homepage_coming_soon: 'În curând',
    homepage_hero_note:
      'O platformă dedicată filmelor și serialelor TV din Moldova: ce a fost deja lansat, ce urmează să apară și pagini detaliate pentru fiecare titlu. Conținutul este administrat printr-un panou de administrare, pentru a organiza și evidenția cinematografia moldovenească.',

    people_title: 'Persoane',
    people_sub: 'Actori și alte persoane din baza de date.',
    people_empty: 'Nu există persoane încă.',

    profile_biography: 'Biografie',
    profile_no_bio: 'Nu există biografie încă.',
    profile_filmography: 'Filmografie',
    profile_no_titles: 'Nu există titluri încă.',
    profile_no_image: 'Fără imagine',
    profile_born: 'Născut',
    profile_gender: 'Gen',
    profile_place_of_birth: 'Locul nașterii',
    profile_earnings: 'Câștiguri',

    gender_male: 'Masculin',
    gender_female: 'Feminin',
    gender_unspecified: 'Nespecificat',

    news_summary: 'Rezumat',
    news_content: 'Conținut',

    menu_login: 'Autentificare',
    menu_logout: 'Deconectare',
    menu_bookmarks: 'Favorite',
    menu_admin: 'Admin',
    menu_continue_google: 'Continuă cu Google',
    menu_admin_login: 'Autentificare admin',

    role_user: 'Utilizator',
    role_admin: 'Admin',

    bookmarks_title: 'Favorite',
    bookmarks_sub: 'Titlurile salvate (filme și seriale).',
    bookmarks_empty: 'Nu ai favorite încă.',
    bookmarks_search_title: 'Caută titlu',
    bookmarks_all: 'Toate',
    bookmarks_newest: 'Cele mai noi',
    bookmarks_oldest: 'Cele mai vechi',
  },
  ru: {
    nav_movies: 'Фильмы',
    nav_series: 'Сериалы',
    nav_news: 'Новости',
    nav_people: 'Люди',
    search_placeholder: 'Поиск',
    theme_label: 'Тема',

    refresh: 'Обновить',
    reset: 'Сброс',
    prev: 'Назад',
    next: 'Вперёд',
    back: 'Назад',

    filters: 'Фильтры',
    release_date: 'Дата релиза',
    sort: 'Сортировка',
    status: 'Статус',

    status_all: 'Все',
    status_upcoming: 'Скоро',
    status_ongoing: 'Идёт',
    status_ended: 'Завершён',

    sort_latest: 'Новые',
    sort_oldest: 'Старые',
    sort_title_asc: 'Название A–Z',
    sort_title_desc: 'Название Z–A',

    showing: 'Показано',
    of: 'из',
    page: 'Страница',

    loading: 'Загрузка…',
    not_found: 'Не найдено.',

    movies_title: 'Фильмы',
    movies_sub: 'Просматривайте все фильмы в базе данных.',
    movies_empty: 'Фильмы не найдены.',

    series_title: 'Сериалы',
    series_sub: 'Просматривайте все сериалы в базе данных.',
    series_empty: 'Сериалы не найдены.',

    news_title: 'Новости',
    news_sub: 'Последние объявления и обновления.',
    news_empty: 'Новостей пока нет.',

    title_overview: 'Описание',
    title_no_synopsis: 'Описание отсутствует.',
    title_directors: 'Режиссёры',
    title_no_directors: 'Режиссёры не указаны.',
    title_top_cast: 'Актёры',
    title_no_cast: 'Актёры не указаны.',
    title_cast_fallback: 'Актёры',

    poster_fallback: 'Нет постера',
    release_chip: 'Релиз',
    type_chip: 'Тип',
    duration_chip: 'Длительность',
    seasons_chip: 'Сезоны',
    series_status_chip: 'Статус',

    type_movie: 'Фильм',
    type_series: 'Сериал',
    type_media: 'Медиа',
    unit_min: 'мин',

    role_director: 'Режиссёр',
    role_actor: 'Актёр',

    homepage_subtitle: 'Веб-платформа для продвижения молдавского кино',
    homepage_admin: 'Админ',
    homepage_featured: 'Избранное',
    homepage_featured_desc: 'Подборка от администратора. Несколько достойных рекомендаций.',
    homepage_latest_movies: 'Новые фильмы',
    homepage_latest_series: 'Новые сериалы',
    homepage_recently_added: 'Добавлено недавно',
    homepage_upcoming_movies: 'Скоро фильмы',
    homepage_upcoming_series: 'Скоро сериалы',
    homepage_coming_soon: 'Скоро',
    homepage_hero_note:
      'Платформа, посвящённая молдавским фильмам и сериалам: что уже вышло, что скоро выйдет, и подробные страницы для каждого тайтла. Контент управляется через админ-панель — это помогает структурировать и показывать молдавское кино.',

    people_title: 'Люди',
    people_sub: 'Актёры и другие люди в вашей базе данных.',
    people_empty: 'Людей пока нет.',

    profile_biography: 'Биография',
    profile_no_bio: 'Биография отсутствует.',
    profile_filmography: 'Фильмография',
    profile_no_titles: 'Титулов пока нет.',
    profile_no_image: 'Нет изображения',
    profile_born: 'Родился',
    profile_gender: 'Пол',
    profile_place_of_birth: 'Место рождения',
    profile_earnings: 'Доход',

    gender_male: 'Мужской',
    gender_female: 'Женский',
    gender_unspecified: 'Не указан',

    news_summary: 'Кратко',
    news_content: 'Текст',

    menu_login: 'Войти',
    menu_logout: 'Выйти',
    menu_bookmarks: 'Закладки',
    menu_admin: 'Админ',
    menu_continue_google: 'Продолжить с Google',
    menu_admin_login: 'Вход для админа',

    role_user: 'Пользователь',
    role_admin: 'Админ',

    bookmarks_title: 'Закладки',
    bookmarks_sub: 'Сохранённые тайтлы (фильмы и сериалы).',
    bookmarks_empty: 'Закладок пока нет.',
    bookmarks_search_title: 'Поиск по названию',
    bookmarks_all: 'Все',
    bookmarks_newest: 'Новые',
    bookmarks_oldest: 'Старые',
  },
};

export function t(lang: PublicLang, key: string): string {
  return DICT[lang]?.[key] ?? DICT.en[key] ?? key;
}

export function tMediaType(lang: PublicLang, typeName: string | null | undefined): string {
  const raw = (typeName ?? '').toUpperCase();
  if (raw === 'MOVIE') return t(lang, 'type_movie');
  if (raw === 'SERIES') return t(lang, 'type_series');
  if (raw === 'MEDIA') return t(lang, 'type_media');
  return typeName ?? '—';
}
