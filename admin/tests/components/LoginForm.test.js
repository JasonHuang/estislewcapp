import { describe, it, expect, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { createTestingPinia } from '@pinia/testing';
import LoginForm from '@/components/LoginForm.vue';

describe('LoginForm', () => {
  let wrapper;
  let userStore;

  beforeEach(() => {
    const pinia = createTestingPinia({
      createSpy: vi.fn,
      initialState: {
        user: {
          token: null,
          userInfo: null
        }
      }
    });

    wrapper = mount(LoginForm, {
      global: {
        plugins: [pinia]
      }
    });

    userStore = wrapper.vm.userStore;
  });

  it('renders properly', () => {
    expect(wrapper.exists()).toBe(true);
    expect(wrapper.find('form').exists()).toBe(true);
    expect(wrapper.find('input[type="text"]').exists()).toBe(true);
    expect(wrapper.find('input[type="password"]').exists()).toBe(true);
    expect(wrapper.find('button[type="submit"]').exists()).toBe(true);
  });

  it('validates form before submission', async () => {
    const submitButton = wrapper.find('button[type="submit"]');
    await submitButton.trigger('click');

    expect(userStore.loginUser).not.toHaveBeenCalled();
    expect(wrapper.find('.el-form-item__error').exists()).toBe(true);
  });

  it('submits form with valid data', async () => {
    const usernameInput = wrapper.find('input[type="text"]');
    const passwordInput = wrapper.find('input[type="password"]');
    const submitButton = wrapper.find('button[type="submit"]');

    await usernameInput.setValue('testuser');
    await passwordInput.setValue('password123');
    await submitButton.trigger('click');

    expect(userStore.loginUser).toHaveBeenCalledWith({
      username: 'testuser',
      password: 'password123'
    });
  });

  it('shows error message on login failure', async () => {
    userStore.loginUser.mockRejectedValueOnce(new Error('登录失败'));

    const usernameInput = wrapper.find('input[type="text"]');
    const passwordInput = wrapper.find('input[type="password"]');
    const submitButton = wrapper.find('button[type="submit"]');

    await usernameInput.setValue('testuser');
    await passwordInput.setValue('password123');
    await submitButton.trigger('click');

    expect(wrapper.find('.el-message--error').exists()).toBe(true);
  });
}); 