import { signalStore, withComputed, withMethods, withState } from '@ngrx/signals';
import { computed, inject } from '@angular/core';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { Observable, delay, of, switchMap, tap } from 'rxjs';

export interface User {
  id: number;
  firstName: string;
  lastName: string;
}

interface UserState {
  users: User[];
  loading: boolean;
}

const initialState: UserState = {
  users: [],
  loading: false,
};

// Fake API service
class UserApiService {
  getUsers(ids: number[]): Observable<User[]> {
    const allUsers: User[] = [
      { id: 1, firstName: 'John', lastName: 'Doe' },
      { id: 2, firstName: 'Jane', lastName: 'Smith' },
      { id: 3, firstName: 'Bob', lastName: 'Johnson' },
      { id: 4, firstName: 'Alice', lastName: 'Williams' },
    ];
    const requestedUsers = allUsers.filter(user => ids.includes(user.id));
    return of(requestedUsers).pipe(delay(800)); // Simulate network delay
  }
}

export const UserStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withComputed((state) => ({
    isLoading: computed(() => state.loading()),
    getUserById: computed(() => (id: number) => state.users().find(user => user.id === id)),
  })),
  withMethods((state, apiService = inject(UserApiService)) => ({
    setUsers(users: User[]) {
      state.update(current => ({ ...current, users: [...current.users, ...users] }));
    },
    setLoading(loading: boolean) {
      state.update(current => ({ ...current, loading }));
    },
    loadUsers: rxMethod<number[]>(
      (ids$) => ids$.pipe(
        tap(() => state.setLoading(true)),
        switchMap(ids => apiService.getUsers(ids)),
        tap(users => {
          state.setUsers(users);
          state.setLoading(false);
        })
      )
    ),
  }))
);