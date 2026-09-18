(() => {
  const notification = document.querySelector('#notification');
  const image = document.querySelector('#notificationImage');
  const brand = document.querySelector('#notificationBrand');
  const title = document.querySelector('#notificationTitle');
  const description = document.querySelector('#notificationDescription');
  const dismissButton = document.querySelector('#dismissButton');
  const actionButton = document.querySelector('#actionButton');

  // The JSON file keeps notification content separate from the presentation.
  fetch('notification-bar.json')
    .then((response) => {
      if (!response.ok) throw new Error(`Unable to load notification data: ${response.status}`);
      return response.json();
    })
    .then((data) => {
      brand.textContent = data.brand;
      title.textContent = data.title;
      description.textContent = data.description;
      image.src = data.image;
      image.alt = data.imageAlt;
      actionButton.textContent = data.actionLabel;
      document.title = `${data.title} — ${data.brand}`;
    })
    .catch((error) => console.warn(error.message));

  dismissButton.addEventListener('click', () => {
    notification.classList.add('is-hidden');
  });

  actionButton.addEventListener('click', () => {
    document.querySelector('.demo-shell').scrollIntoView({ behavior: 'smooth' });
  });
})();
