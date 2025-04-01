function handleSidebarClick(event, url) {
  event.preventDefault(); // Ngăn chặn hành động mặc định (không để trang cũ bị lỗi)
  window.open(url, "_blank"); // Mở link trong tab mới
}