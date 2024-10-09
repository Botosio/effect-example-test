import { signalStore, withComputed, withMethods, withState } from '@ngrx/signals';
import { computed, inject } from '@angular/core';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { Observable, delay, of, switchMap, tap } from 'rxjs';

export interface WorkOrder {
  id: number;
  userId: number;
  title: string;
  status: 'open' | 'in-progress' | 'completed';
  description: string;
}

interface WorkOrderState {
  workOrders: WorkOrder[];
  loading: boolean;
}

const initialState: WorkOrderState = {
  workOrders: [],
  loading: false,
};

// Fake API service
class WorkOrderApiService {
  getWorkOrders(): Observable<WorkOrder[]> {
    const fakeWorkOrders: WorkOrder[] = [
      { id: 1, userId: 1, title: 'Fix the sink', status: 'open', description: 'The kitchen sink is leaking.' },
      { id: 2, userId: 1, title: 'Paint the living room', status: 'in-progress', description: 'Walls need a fresh coat of paint.' },
      { id: 3, userId: 2, title: 'Mow the lawn', status: 'completed', description: 'The grass is getting too long.' },
    ];
    return of(fakeWorkOrders).pipe(delay(1000)); // Simulate network delay
  }
}

export const WorkOrderStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withComputed((state) => ({
    isLoading: computed(() => state.loading()),
    completedWorkOrders: computed(() => state.workOrders().filter(wo => wo.status === 'completed')),
  })),
  withMethods((state, apiService = inject(WorkOrderApiService)) => ({
    setWorkOrders(workOrders: WorkOrder[]) {
      state.update(current => ({ ...current, workOrders }));
    },
    addWorkOrder(workOrder: WorkOrder) {
      state.update(current => ({ ...current, workOrders: [...current.workOrders, workOrder] }));
    },
    updateWorkOrder(updatedWorkOrder: WorkOrder) {
      state.update(current => ({
        ...current,
        workOrders: current.workOrders.map(wo => wo.id === updatedWorkOrder.id ? updatedWorkOrder : wo)
      }));
    },
    setLoading(loading: boolean) {
      state.update(current => ({ ...current, loading }));
    },
    loadWorkOrders: rxMethod<void>(
      () => {
        return of(void 0).pipe(
          tap(() => state.setLoading(true)),
          switchMap(() => apiService.getWorkOrders()),
          tap(workOrders => {
            state.setWorkOrders(workOrders);
            state.setLoading(false);
          })
        );
      }
    )
  }))
);